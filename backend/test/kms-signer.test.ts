import { describe, expect, it } from 'bun:test';
import { Signature, SigningKey, Transaction, computeAddress, getBytes, hexlify, recoverAddress, hashMessage, verifyMessage } from 'ethers';
import { KmsSigner } from '../src/modules/chain/kms-signer';

// A fake Cloud KMS that behaves like EC_SIGN_SECP256K1_SHA256: signs the 32-byte digest it is given, returns DER.
const KEY = new SigningKey('0x' + '11'.repeat(32));
const SPKI_PREFIX = Buffer.from('3056301006072a8648ce3d020106052b8104000a034200', 'hex');
const pem = `-----BEGIN PUBLIC KEY-----\n${Buffer.concat([SPKI_PREFIX, getBytes(KEY.publicKey)]).toString('base64')}\n-----END PUBLIC KEY-----\n`;
const der = (n: bigint) => {
  let h = n.toString(16);
  if (h.length % 2) h = '0' + h;
  if (parseInt(h.slice(0, 2), 16) >= 0x80) h = '00' + h;
  return Buffer.from(`02${(h.length / 2).toString(16).padStart(2, '0')}${h}`, 'hex');
};
// Returns the HIGH-s form half the time, as real KMS does, so the signer's low-s normalisation is exercised.
const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
let flip = false;
const fake = {
  getPublicKey: async () => [{ pem }],
  asymmetricSign: async ({ digest }: { digest: { sha256: Buffer } }) => {
    const sig = KEY.sign(hexlify(digest.sha256));
    let s = BigInt(sig.s);
    if ((flip = !flip)) s = N - s;
    const body = Buffer.concat([der(BigInt(sig.r)), der(s)]);
    return [{ signature: Buffer.concat([Buffer.from([0x30, body.length]), body]) }];
  },
} as never;

describe('KmsSigner', () => {
  const signer = new KmsSigner('projects/p/locations/l/keyRings/r/cryptoKeys/k/cryptoKeyVersions/1', null, fake);

  it('derives the Ethereum address from the KMS public key', async () => {
    expect(await signer.getAddress()).toBe(computeAddress(KEY.publicKey));
  });

  it('signs transactions that recover to the registrar, whichever s KMS returns', async () => {
    for (let i = 0; i < 4; i++) {
      const raw = await signer.signTransaction({ to: '0x' + '22'.repeat(20), nonce: i, chainId: 1337, gasLimit: 21000, maxFeePerGas: 1, maxPriorityFeePerGas: 1, type: 2 });
      const tx = Transaction.from(raw);
      expect(tx.from).toBe(computeAddress(KEY.publicKey));
      expect(BigInt(tx.signature!.s) <= N / 2n).toBe(true);
    }
  });

  it('signs messages', async () => {
    const sig = await signer.signMessage('hello');
    expect(verifyMessage('hello', sig)).toBe(computeAddress(KEY.publicKey));
    expect(recoverAddress(hashMessage('hello'), Signature.from(sig))).toBe(computeAddress(KEY.publicKey));
  });
});
