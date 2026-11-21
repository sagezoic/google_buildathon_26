import { Contract, JsonRpcProvider, Wallet, ContractFactory, formatEther, type Signer } from 'ethers';
import { env } from '../../config/env';
import { ApiError } from '../../lib/errors';
import { KmsSigner } from './kms-signer';
import artifact from './PropertyRegistry.json';

export const registryAbi = artifact.abi;

export interface RegistryRecord {
  ownerRef: string;
  docRoot: string;
  metadataHash: string;
  attestation: string;
  docCount: number;
  version: number;
  updatedAt: number;
  status: 'none' | 'active' | 'revoked';
  encumbered: boolean;
}

const STATUS = ['none', 'active', 'revoked'] as const;

export const chainConfigured = () => !!env.CHAIN_RPC_URL && !!env.CHAIN_CONTRACT_ADDRESS && !!(env.CHAIN_KMS_KEY || env.CHAIN_PRIVATE_KEY);

const unavailable = () =>
  new ApiError(503, 'Service Unavailable', 'The blockchain ledger is not configured (CHAIN_RPC_URL, CHAIN_CONTRACT_ADDRESS and a signer key).');

let provider: JsonRpcProvider | null = null;
let signer: Signer | null = null;
let contract: Contract | null = null;
let chainId: bigint | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function getSigner(): Signer {
  if (!env.CHAIN_RPC_URL) throw unavailable();
  provider ??= new JsonRpcProvider(env.CHAIN_RPC_URL, undefined, { cacheTimeout: -1 }) // no response cache: back-to-back txs need a fresh nonce;
  signer ??= env.CHAIN_KMS_KEY ? new KmsSigner(env.CHAIN_KMS_KEY, provider) : env.CHAIN_PRIVATE_KEY ? new Wallet(env.CHAIN_PRIVATE_KEY, provider) : null;
  if (!signer) throw unavailable();
  return signer;
}

export function getContract(): Contract {
  if (!env.CHAIN_CONTRACT_ADDRESS) throw unavailable();
  contract ??= new Contract(env.CHAIN_CONTRACT_ADDRESS, registryAbi, getSigner());
  return contract;
}

export async function getChainId(): Promise<number> {
  chainId ??= (await getSigner().provider!.getNetwork()).chainId;
  return Number(chainId);
}

/** Registrar transactions are sent one at a time so nonces never collide inside an instance. */
export function serialised<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

export async function readRecord(tokenId: string): Promise<RegistryRecord> {
  const r = await getContract().getRecord(BigInt(tokenId));
  return {
    ownerRef: r.ownerRef,
    docRoot: r.docRoot,
    metadataHash: r.metadataHash,
    attestation: r.attestation,
    docCount: Number(r.docCount),
    version: Number(r.version),
    updatedAt: Number(r.updatedAt),
    status: STATUS[Number(r.status)],
    encumbered: r.encumbered,
  };
}

export async function verifyOnChain(tokenId: string, leaf: string, proof: string[]): Promise<boolean> {
  return getContract().verifyDocument(BigInt(tokenId), leaf, proof);
}

export async function chainStatus() {
  if (!chainConfigured()) return { configured: false as const, network: env.CHAIN_NETWORK };
  const s = getSigner();
  const address = await s.getAddress();
  const [id, balance] = await Promise.all([getChainId(), s.provider!.getBalance(address)]);
  return {
    configured: true as const,
    network: env.CHAIN_NETWORK,
    chainId: id,
    contract: env.CHAIN_CONTRACT_ADDRESS!,
    registrar: address,
    registrarBalance: formatEther(balance),
    signer: env.CHAIN_KMS_KEY ? ('cloud-kms' as const) : ('local-key' as const),
  };
}

export const explorerTx = (hash: string) => (env.CHAIN_EXPLORER_URL ? `${env.CHAIN_EXPLORER_URL.replace(/\/$/, '')}/tx/${hash}` : null);

/** Deploys PropertyRegistry with the configured signer. Used by `bun run chain:deploy`. */
export async function deployRegistry(baseUri: string): Promise<{ address: string; txHash: string }> {
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, getSigner());
  const c = await factory.deploy(baseUri);
  const tx = c.deploymentTransaction();
  await c.waitForDeployment();
  return { address: await c.getAddress(), txHash: tx?.hash ?? '' };
}
