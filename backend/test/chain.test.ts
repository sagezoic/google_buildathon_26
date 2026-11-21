import { afterAll, beforeAll, describe, expect, it, spyOn } from 'bun:test';
import ganache from 'ganache';
import { eq } from 'drizzle-orm';
import { app } from '../src/app';
import { env } from '../src/config/env';
import { closeDb, getDb, testDbConnection } from '../src/db/client';
import { properties, propertyTokens } from '../src/db/schema';
import { StorageService } from '../src/services/storage';
import { propertyIdOf } from '../src/modules/chain/ids';
import { deployRegistry, getContract } from '../src/modules/chain/ledger';
import { buildTree, leafOf, verifyProof } from '../src/modules/chain/merkle';
import { samplePdf } from '../src/modules/chain/sample-pdf';
import { seedDemoTokens } from '../src/modules/chain/demo';

describe('Merkle tree and property ids (no chain needed)', () => {
  it('proves every leaf for 1 to 9 documents and rejects a wrong leaf', () => {
    for (let n = 1; n <= 9; n++) {
      const leaves = Array.from({ length: n }, (_, i) => leafOf(`0x${String(i + 1).padStart(64, '0')}`));
      const { root, proofs } = buildTree(leaves);
      for (const l of leaves) expect(verifyProof(l, proofs[l], root)).toBe(true);
      expect(verifyProof(leafOf(`0x${'ab'.repeat(32)}`), proofs[leaves[0]], root)).toBe(false);
    }
  });

  it('derives the same property id for the same parcel', () => {
    expect(propertyIdOf('IN-MH-PUNE', '112/2')).toEqual(propertyIdOf('IN-MH-PUNE', '112/2'));
    expect(propertyIdOf('IN-MH-PUNE', '112/2').hex).not.toEqual(propertyIdOf('IN-MH-PUNE', '112/3').hex);
  });
});

const hasDatabase = (await testDbConnection()).connected;
const PORT = 18545;
// First deterministic ganache account.
const KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

describe.skipIf(!hasDatabase)('Property tokens on a local chain', () => {
  const files = new Map<string, Buffer>();
  const server = ganache.server({ logging: { quiet: true }, wallet: { accounts: [{ secretKey: KEY, balance: '0x56bc75e2d63100000' }] }, chain: { hardfork: 'shanghai' } });
  const spies = [
    spyOn(StorageService, 'uploadFile').mockImplementation(async (o) => {
      files.set(o.filename, Buffer.from(o.content as Buffer));
      return { filename: o.filename, bucket: 'test', size: 1, contentType: o.contentType ?? '', publicUrl: '' };
    }),
    spyOn(StorageService, 'downloadFile').mockImplementation(async (f) => {
      const content = files.get(f);
      if (!content) throw new Error('not found');
      return { content, contentType: 'application/pdf', size: content.length };
    }),
    spyOn(StorageService, 'deleteFile').mockImplementation(async (f) => ({ success: true, filename: f })),
  ];
  const saved = { ...env };
  const json = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const pdf = (n: string) => samplePdf(['Test doc', n]);
  const upload = (id: string, slot: string, bytes: Buffer, name: string) => {
    const form = new FormData();
    form.set('slot', slot);
    form.set('file', new File([bytes], name));
    return app.handle(new Request(`http://localhost/api/properties/${id}/documents`, { method: 'POST', body: form }));
  };
  const verify = async (bytes: Buffer, propertyId?: string) => {
    const form = new FormData();
    form.set('file', new File([bytes], 'x.pdf'));
    if (propertyId) form.set('propertyId', propertyId);
    return (await (await app.handle(new Request('http://localhost/api/chain/verify', { method: 'POST', body: form }))).json()) as Record<string, any>;
  };
  let propertyId = '';

  beforeAll(async () => {
    await server.listen(PORT);
    Object.assign(env, { CHAIN_RPC_URL: `http://127.0.0.1:${PORT}`, CHAIN_PRIVATE_KEY: KEY, CHAIN_KMS_KEY: undefined, CHAIN_ADMIN_TOKEN: undefined, CHAIN_NETWORK: 'ganache' });
    const { address } = await deployRegistry('http://localhost/api/chain/metadata/');
    env.CHAIN_CONTRACT_ADDRESS = address;
    const res = await app.handle(new Request('http://localhost/api/properties', json({ type: 'plot', gat: `T-${crypto.randomUUID().slice(0, 8)}`, village: 'Kusgaon', taluka: 'Maval', district: 'Pune' })));
    propertyId = ((await res.json()) as { id: string }).id;
  });

  afterAll(async () => {
    if (propertyId) await getDb().delete(properties).where(eq(properties.id, propertyId));
    spies.forEach((s) => s.mockRestore());
    Object.assign(env, saved);
    await server.close();
    await closeDb();
  });

  const approve = (body: object = { approvedBy: 'Adv. Test' }, headers: Record<string, string> = {}) =>
    app.handle(new Request(`http://localhost/api/chain/properties/${propertyId}/approve`, { ...json(body), headers: { 'Content-Type': 'application/json', ...headers } }));

  it('refuses to approve a property with no documents', async () => {
    expect((await approve()).status).toBe(422);
  });

  it('reports ledger status with the registrar address', async () => {
    const s = (await (await app.handle(new Request('http://localhost/api/chain/status'))).json()) as Record<string, any>;
    expect(s.configured).toBe(true);
    expect(s.signer).toBe('local-key');
  });

  const deed = pdf('deed');
  const extract = pdf('extract');

  it('mints a token on approval and the contract agrees with the backend', async () => {
    await upload(propertyId, 'extract', extract, '7-12.pdf');
    await upload(propertyId, 'deed', deed, 'deed.pdf');
    const res = await approve({ approvedBy: 'Adv. Test', ownerName: 'Test Owner' });
    expect(res.status).toBe(200);
    const { changed, token } = (await res.json()) as { changed: boolean; token: Record<string, any> };
    expect(changed).toBe(true);
    expect(token.status).toBe('confirmed');
    expect(token.version).toBe(1);
    expect(token.docCount).toBe(2);
    expect(token.history).toHaveLength(1);

    const c = getContract();
    expect(await c.propertyIdOf(token.jurisdiction, token.parcel)).toBe(BigInt(token.tokenId));
    const live = (await (await app.handle(new Request(`http://localhost/api/chain/properties/${propertyId}`))).json()) as Record<string, any>;
    expect(live.onChain.matches).toBe(true);
    expect(live.onChain.status).toBe('active');
    expect(live.onChain.docRoot).toBe(token.docRoot);
    const meta = JSON.parse((await (await app.handle(new Request(`http://localhost/api/chain/metadata/${token.tokenId}.json`))).text()));
    expect(meta.realdha.docRoot).toBe(token.docRoot);
  });

  it('is idempotent when nothing changed', async () => {
    const { changed, token } = (await (await approve()).json()) as { changed: boolean; token: Record<string, any> };
    expect(changed).toBe(false);
    expect(token.history).toHaveLength(1);
  });

  it('verifies an untouched document, flags an edited one, and does not know a stranger', async () => {
    const ok = await verify(deed, propertyId);
    expect(ok.verdict).toBe('match');
    expect(ok.slot).toBe('deed');
    expect((await verify(deed)).verdict).toBe('match'); // found without naming the property
    const edited = Buffer.concat([deed, Buffer.from('\n% edited')]);
    expect((await verify(edited, propertyId)).verdict).toBe('changed');
    expect((await verify(edited)).verdict).toBe('unknown');
  });

  it('bumps the version when documents change, keeping the history', async () => {
    await upload(propertyId, 'mutation', pdf('mutation'), 'm.pdf');
    const { changed, token } = (await (await approve()).json()) as { changed: boolean; token: Record<string, any> };
    expect(changed).toBe(true);
    expect(token.version).toBe(2);
    expect(token.docCount).toBe(3);
    expect(token.history.map((h: { kind: string }) => h.kind)).toEqual(['register', 'update']);
    expect((await verify(pdf('mutation'), propertyId)).verdict).toBe('match');
    expect((await verify(deed, propertyId)).verdict).toBe('match'); // proofs were rebuilt for the new root
  });

  it('requires the admin token once one is configured', async () => {
    env.CHAIN_ADMIN_TOKEN = 'secret-token';
    expect((await approve()).status).toBe(401);
    expect((await approve({ approvedBy: 'x' }, { Authorization: 'Bearer wrong' })).status).toBe(401);
    expect((await approve({ approvedBy: 'x' }, { Authorization: 'Bearer secret-token' })).status).toBe(200);
    env.CHAIN_ADMIN_TOKEN = undefined;
  });

  it('seeds the demo properties idempotently', async () => {
    for (const id of ['prop_demo_kusgaon_112_2', 'prop_demo_baner_a1804']) await getDb().delete(properties).where(eq(properties.id, id));
    const first = await seedDemoTokens();
    expect(first.map((r) => r.token.status)).toEqual(['confirmed', 'confirmed']);
    const second = await seedDemoTokens();
    expect(second.every((r) => !r.changed)).toBe(true);
    const ids = first.map((r) => r.propertyId);
    for (const id of ids) await getDb().delete(properties).where(eq(properties.id, id));
    expect(await getDb().select().from(propertyTokens).where(eq(propertyTokens.property_id, ids[0]))).toHaveLength(0);
  });
});
