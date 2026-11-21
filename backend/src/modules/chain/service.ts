import { createHash } from 'node:crypto';
import { and, asc, eq, sql } from 'drizzle-orm';
import { keccak256, toUtf8Bytes } from 'ethers';
import { env } from '../../config/env';
import { getDb } from '../../db/client';
import {
  properties, propertyDocuments, propertyTokens, propertyTokenTxs,
  type PropertyToken, type PropertyTokenTx, type TokenManifestDoc,
} from '../../db/schema';
import { ApiError, badRequest, notFound, unprocessable } from '../../lib/errors';
import { StorageService } from '../../services/storage';
import { ownerRefOf, parcelKey, propertyIdOf } from './ids';
import { chainConfigured, getChainId, getContract, readRecord, serialised, verifyOnChain, explorerTx, type RegistryRecord } from './ledger';
import { buildTree, leafOf, verifyProof } from './merkle';

export interface ApproveInput {
  approvedBy: string;
  /** Falls back to the owner read from the 7/12 extract. */
  ownerName?: string;
}

const sha256Of = (content: Uint8Array) => `0x${createHash('sha256').update(content).digest('hex')}`;
const metadataPath = (tokenId: string) => `chain/metadata/${tokenId}.json`;
const requireChain = () => {
  if (!chainConfigured()) {
    throw new ApiError(503, 'Service Unavailable', 'The blockchain ledger is not configured (CHAIN_RPC_URL, CHAIN_CONTRACT_ADDRESS and a signer key).');
  }
};

/** Base URI the contract embeds in tokenURI. Points at this API, so no bucket needs to be public. */
export const metadataBaseUri = () => `${(env.PUBLIC_API_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '')}/api/chain/metadata/`;

function buildMetadata(p: typeof properties.$inferSelect, t: {
  tokenId: string; propertyKey: string; jurisdiction: string; parcel: string; docRoot: string; version: number; manifest: TokenManifestDoc[];
}) {
  return {
    name: `Realdha property record · ${t.parcel}`,
    description: 'Non-transferable record of a lawyer-approved property file. Documents are held off-chain; only their hashes are anchored.',
    attributes: [
      { trait_type: 'Type', value: p.type },
      { trait_type: 'Village', value: p.village },
      { trait_type: 'Taluka', value: p.taluka },
      { trait_type: 'District', value: p.district },
      { trait_type: 'Parcel', value: t.parcel },
      { trait_type: 'Version', value: t.version },
      { trait_type: 'Documents', value: t.manifest.length },
    ].filter((a) => a.value !== null && a.value !== undefined),
    realdha: {
      network: env.CHAIN_NETWORK,
      contract: env.CHAIN_CONTRACT_ADDRESS,
      tokenId: t.tokenId,
      propertyKey: t.propertyKey,
      jurisdiction: t.jurisdiction,
      docRoot: t.docRoot,
      documents: t.manifest.map(({ slot, sha256, leaf, size }) => ({ slot, sha256, leaf, size })),
    },
  };
}

export type TokenView = ReturnType<typeof tokenDto>;

export const tokenDto = (t: PropertyToken, txs: PropertyTokenTx[] = []) => ({
  propertyId: t.property_id,
  tokenId: t.token_id,
  propertyKey: t.property_key,
  jurisdiction: t.jurisdiction,
  parcel: t.parcel,
  status: t.status,
  version: t.version,
  docRoot: t.doc_root,
  docCount: t.doc_count,
  documents: t.manifest.map((d) => ({ slot: d.slot, filename: d.filename, size: d.size, sha256: d.sha256 })),
  attestation: t.attestation,
  approvedBy: t.approved_by,
  approvedAt: t.approved_at.toISOString(),
  network: t.network,
  chainId: t.chain_id,
  contract: t.contract_address,
  txHash: t.tx_hash,
  explorerUrl: t.tx_hash ? explorerTx(t.tx_hash) : null,
  blockNumber: t.block_number,
  metadataUrl: `${metadataBaseUri()}${t.token_id}.json`,
  error: t.error,
  history: txs.map((x) => ({ kind: x.kind, version: x.version, docRoot: x.doc_root, txHash: x.tx_hash, blockNumber: x.block_number, at: x.created_at.toISOString(), explorerUrl: explorerTx(x.tx_hash) })),
});

export const ChainService = {
  /**
   * Lawyer approval: hash every document, build the Merkle manifest, store the token metadata in Cloud Storage,
   * then register (first time) or update (documents changed) the token on-chain. Idempotent for unchanged files.
   */
  async approve(propertyId: string, input: ApproveInput): Promise<{ token: TokenView; changed: boolean }> {
    requireChain();
    const db = getDb();
    const [p] = await db.select().from(properties).where(eq(properties.id, propertyId));
    if (!p) throw notFound('Property not found.');
    const docs = await db.select().from(propertyDocuments).where(eq(propertyDocuments.property_id, propertyId)).orderBy(asc(propertyDocuments.slot), asc(propertyDocuments.created_at));
    if (docs.length === 0) throw unprocessable('Upload at least one document before approving a property.');
    const failed = docs.filter((d) => d.status === 'failed');
    if (failed.length) throw unprocessable(`${failed.length} document(s) failed processing; reprocess or delete them first.`);

    const { jurisdiction, parcel } = parcelKey(p);
    const id = propertyIdOf(jurisdiction, parcel);

    const manifest: TokenManifestDoc[] = [];
    for (const d of docs) {
      const { content } = await StorageService.downloadFile(d.gcs_path);
      const sha = sha256Of(content);
      manifest.push({ slot: d.slot, filename: d.filename, size: d.size, sha256: sha, leaf: leafOf(sha) });
    }
    manifest.sort((a, b) => (a.leaf < b.leaf ? -1 : a.leaf > b.leaf ? 1 : 0));
    // A duplicate file would repeat a leaf and make its proof ambiguous; count it once.
    const unique = manifest.filter((m, i) => i === 0 || m.leaf !== manifest[i - 1].leaf);
    const tree = buildTree(unique.map((m) => m.leaf));

    const [existing] = await db.select().from(propertyTokens).where(eq(propertyTokens.property_id, propertyId));
    if (existing?.status === 'confirmed' && existing.doc_root === tree.root) {
      return { token: tokenDto(existing, await historyOf(existing.token_id)), changed: false };
    }
    if (existing?.status === 'pending' && Date.now() - existing.updated_at.getTime() < 120_000) {
      throw new ApiError(409, 'Conflict', 'An approval for this property is already being anchored.');
    }

    if (existing?.status === 'confirmed' && existing.token_id !== id.token) {
      throw new ApiError(409, 'Conflict', 'The land identifiers changed since this property was anchored. A changed parcel needs a registrar correction, not a re-approval.');
    }

    const approvedAt = new Date();
    const version = existing?.status === 'confirmed' ? existing.version + 1 : 1;
    const metadata = buildMetadata(p, { tokenId: id.token, propertyKey: id.hex, jurisdiction, parcel, docRoot: tree.root, version, manifest: unique });
    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataHash = keccak256(toUtf8Bytes(metadataJson));
    const attestation = keccak256(toUtf8Bytes(JSON.stringify({ propertyId, tokenId: id.token, docRoot: tree.root, approvedBy: input.approvedBy, approvedAt: approvedAt.toISOString() })));
    let ownerRef = existing?.owner_ref;
    if (!ownerRef) {
      const ownerName =
        input.ownerName?.trim() ||
        docs.map((d) => d.fields as { ownerEn?: string; owner?: string } | null).map((f) => f?.ownerEn ?? f?.owner).find(Boolean) ||
        '';
      if (!ownerName) throw unprocessable('No owner name found in the documents. Pass ownerName with the approval.');
      ownerRef = ownerRefOf(ownerName, propertyId);
    }
    const chainId = await getChainId();

    await StorageService.uploadFile({ filename: metadataPath(id.token), content: Buffer.from(metadataJson), contentType: 'application/json' });

    const base = {
      property_key: id.hex, jurisdiction, parcel, owner_ref: ownerRef, doc_root: tree.root, doc_count: unique.length,
      manifest: unique, proofs: tree.proofs, metadata_hash: metadataHash, metadata_gcs_path: metadataPath(id.token),
      attestation, approved_by: input.approvedBy, approved_at: approvedAt, network: env.CHAIN_NETWORK, chain_id: chainId,
      contract_address: env.CHAIN_CONTRACT_ADDRESS!,
    };
    const kind: 'register' | 'update' = existing?.status === 'confirmed' ? 'update' : 'register';

    // Claim the property first: the unique index on property_id / token_id stops two approvals racing to mint.
    if (existing) {
      // Keep the confirmed row's live fields until the update lands; only mark that an anchor is in flight.
      await db.update(propertyTokens).set({ ...(kind === 'register' ? { ...base, token_id: id.token, version, status: 'pending', error: null } : { error: null }), updated_at: new Date() }).where(eq(propertyTokens.id, existing.id));
    } else {
      await db.insert(propertyTokens).values({ id: `tok_${crypto.randomUUID()}`, property_id: propertyId, token_id: id.token, ...base, version, status: 'pending' });
    }

    try {
      const receipt = await serialised(async () => {
        const c = getContract();
        const tx =
          kind === 'register'
            ? await c.register(BigInt(id.token), ownerRef, tree.root, metadataHash, attestation, unique.length)
            : await c.update(BigInt(id.token), tree.root, metadataHash, attestation, unique.length);
        const r = await tx.wait();
        if (!r || r.status !== 1) throw new Error(`Transaction ${tx.hash} reverted.`);
        return r;
      });
      const [row] = await db.update(propertyTokens).set({ ...base, version, status: 'confirmed', tx_hash: receipt.hash, block_number: receipt.blockNumber, error: null, updated_at: new Date() }).where(eq(propertyTokens.property_id, propertyId)).returning();
      await db.insert(propertyTokenTxs).values({ token_id: id.token, kind, version, doc_root: tree.root, tx_hash: receipt.hash, block_number: receipt.blockNumber });
      return { token: tokenDto(row, await historyOf(id.token)), changed: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await db.update(propertyTokens).set({ status: kind === 'register' ? 'failed' : 'confirmed', error: message, updated_at: new Date() }).where(eq(propertyTokens.property_id, propertyId));
      throw new ApiError(502, 'Bad Gateway', `Anchoring failed: ${message}`);
    }
  },

  async getToken(propertyId: string): Promise<{ token: TokenView; onChain: (RegistryRecord & { matches: boolean }) | null }> {
    const [t] = await getDb().select().from(propertyTokens).where(eq(propertyTokens.property_id, propertyId));
    if (!t) throw notFound('This property has no blockchain token yet.');
    let onChain: (RegistryRecord & { matches: boolean }) | null = null;
    if (chainConfigured() && t.status === 'confirmed') {
      try {
        const r = await readRecord(t.token_id);
        onChain = { ...r, matches: r.status === 'active' && r.docRoot === t.doc_root };
      } catch (e) {
        console.warn('[chain] Could not read on-chain record', e);
      }
    }
    return { token: tokenDto(t, await historyOf(t.token_id)), onChain };
  },

  async metadata(tokenId: string): Promise<Buffer> {
    if (!/^\d{1,78}$/.test(tokenId)) throw badRequest('Invalid token id.');
    try {
      return (await StorageService.downloadFile(metadataPath(tokenId))).content;
    } catch {
      throw notFound('Token metadata not found.');
    }
  },

  /**
   * Is this file one of the documents anchored for the property? The file is hashed here and checked against
   * the manifest, the Merkle proof, and the registry contract itself. Nothing about the file is stored.
   */
  async verifyFile(file: File, propertyId?: string) {
    requireChain();
    const sha = sha256Of(new Uint8Array(await file.arrayBuffer()));
    const db = getDb();
    const rows = propertyId
      ? await db.select().from(propertyTokens).where(eq(propertyTokens.property_id, propertyId))
      : await db.select().from(propertyTokens).where(and(eq(propertyTokens.status, 'confirmed'),
        // bun-sql stores a JSON string as a jsonb *string*: unwrap the column with `#>> '{}'` and send the needle via ::text.
        sql`(${propertyTokens.manifest} #>> '{}')::jsonb @> ${JSON.stringify([{ sha256: sha }])}::text::jsonb`));
    const token = rows[0];
    if (propertyId && !token) throw notFound('This property has no blockchain token yet.');
    if (!token) return { verdict: 'unknown' as const, sha256: sha, message: 'No anchored property contains this file.' };

    const entry = token.manifest.find((m) => m.sha256 === sha);
    const base = { sha256: sha, propertyId: token.property_id, tokenId: token.token_id, network: token.network, contract: token.contract_address, version: token.version };
    if (!entry) {
      return { ...base, verdict: 'changed' as const, message: 'This file does not match any document anchored for this property. It may have been edited, or it is a different file.' };
    }
    const proof = token.proofs[entry.leaf] ?? [];
    const proofOk = verifyProof(entry.leaf, proof, token.doc_root);
    const chain = await readRecord(token.token_id);
    const onChainOk = chain.status === 'active' && (await verifyOnChain(token.token_id, entry.leaf, proof));
    const ok = proofOk && onChainOk && chain.docRoot === token.doc_root;
    return {
      ...base,
      verdict: ok ? ('match' as const) : ('changed' as const),
      slot: entry.slot,
      anchoredAt: token.approved_at.toISOString(),
      txHash: token.tx_hash,
      explorerUrl: token.tx_hash ? explorerTx(token.tx_hash) : null,
      encumbered: chain.encumbered,
      message: ok
        ? `Matches the ${entry.slot} document anchored on ${token.network}.`
        : chain.status !== 'active'
          ? 'The on-chain record for this property is not active.'
          : 'The stored manifest no longer agrees with the on-chain record.',
    };
  },
};

async function historyOf(tokenId: string): Promise<PropertyTokenTx[]> {
  return getDb().select().from(propertyTokenTxs).where(eq(propertyTokenTxs.token_id, tokenId)).orderBy(asc(propertyTokenTxs.version));
}
