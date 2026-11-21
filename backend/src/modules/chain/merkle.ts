import { keccak256, getBytes, concat, hexlify } from 'ethers';

/** Leaf node for a document: keccak256 over its sha256, so a leaf can never be mistaken for an inner node. */
export const leafOf = (sha256Hex: string): string => keccak256(sha256Hex);

const hashPair = (a: string, b: string): string => (a < b ? keccak256(concat([a, b])) : keccak256(concat([b, a])));

export interface MerkleTree {
  root: string;
  /** Sibling hashes from each leaf up to the root, by leaf hash. */
  proofs: Record<string, string[]>;
}

/** Sorted-pair Merkle tree (OpenZeppelin-compatible). An odd node is promoted unchanged. */
export function buildTree(leaves: string[]): MerkleTree {
  if (leaves.length === 0) throw new Error('Cannot build a Merkle tree without leaves.');
  const proofs: Record<string, string[]> = Object.fromEntries(leaves.map((l) => [l, [] as string[]]));
  // Each leaf tracks which current-level node it sits under.
  let level = leaves.map((l, i) => ({ hash: l, members: [i] }));
  while (level.length > 1) {
    const next: typeof level = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1];
      if (!right) {
        next.push(left);
        continue;
      }
      for (const m of left.members) proofs[leaves[m]].push(right.hash);
      for (const m of right.members) proofs[leaves[m]].push(left.hash);
      next.push({ hash: hashPair(left.hash, right.hash), members: [...left.members, ...right.members] });
    }
    level = next;
  }
  return { root: level[0].hash, proofs };
}

export function verifyProof(leaf: string, proof: string[], root: string): boolean {
  return proof.reduce(hashPair, leaf) === root;
}

export const hex = (b: Uint8Array) => hexlify(b);
export { getBytes };
