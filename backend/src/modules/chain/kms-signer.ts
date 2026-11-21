import { KeyManagementServiceClient } from '@google-cloud/kms';
import {
  AbstractSigner, Signature, Transaction, computeAddress, getAddress, recoverAddress, hexlify, toBeHex,
  type Provider, type TransactionRequest, type TypedDataDomain, type TypedDataField, hashMessage, TypedDataEncoder,
} from 'ethers';
import { gcpClientOptions } from '../../services/gcp-auth';

const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

/** Reads r and s out of an ASN.1 DER ECDSA signature. */
function parseDer(der: Uint8Array): { r: bigint; s: bigint } {
  let i = 2; // 0x30 len
  if (der[1] & 0x80) i += der[1] & 0x7f;
  const read = () => {
    if (der[i++] !== 0x02) throw new Error('Malformed KMS signature.');
    const len = der[i++];
    const v = BigInt(hexlify(der.slice(i, i + len)));
    i += len;
    return v;
  };
  return { r: read(), s: read() };
}

/** Public key (PEM, SubjectPublicKeyInfo) to an uncompressed secp256k1 point: the last 65 bytes of the DER. */
const pemToPoint = (pem: string) => {
  const der = Buffer.from(pem.replace(/-----[^-]+-----|\s/g, ''), 'base64');
  return hexlify(der.subarray(der.length - 65));
};

/**
 * Ethers signer whose private key lives in Cloud KMS (HSM, EC_SIGN_SECP256K1_SHA256).
 * The app only ever sees digests and signatures; the key cannot be exported.
 */
export class KmsSigner extends AbstractSigner {
  private address?: string;

  constructor(
    private readonly keyVersion: string,
    provider?: Provider | null,
    private readonly client: Pick<KeyManagementServiceClient, 'getPublicKey' | 'asymmetricSign'> = new KeyManagementServiceClient(gcpClientOptions()),
  ) {
    super(provider);
  }

  connect(provider: Provider | null): KmsSigner {
    return new KmsSigner(this.keyVersion, provider, this.client);
  }

  async getAddress(): Promise<string> {
    if (!this.address) {
      const [pk] = await this.client.getPublicKey({ name: this.keyVersion });
      if (!pk.pem) throw new Error('KMS returned no public key.');
      this.address = computeAddress(pemToPoint(pk.pem));
    }
    return this.address;
  }

  private async signDigest(digest: string): Promise<Signature> {
    const [res] = await this.client.asymmetricSign({
      name: this.keyVersion,
      digest: { sha256: Buffer.from(digest.slice(2), 'hex') }, // KMS signs the 32 bytes as given
    });
    if (!res.signature) throw new Error('KMS returned no signature.');
    const { r, s: raw } = parseDer(Buffer.from(res.signature as Uint8Array));
    const s = raw > N / 2n ? N - raw : raw; // Ethereum requires low-s
    const expected = await this.getAddress();
    for (const v of [27, 28]) {
      const sig = Signature.from({ r: toBeHex(r, 32), s: toBeHex(s, 32), v });
      if (getAddress(recoverAddress(digest, sig)) === expected) return sig;
    }
    throw new Error('KMS signature does not recover to the registrar address.');
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    const t = Transaction.from(tx as never);
    t.signature = await this.signDigest(t.unsignedHash);
    return t.serialized;
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    return (await this.signDigest(hashMessage(message))).serialized;
  }

  async signTypedData(domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, unknown>): Promise<string> {
    return (await this.signDigest(TypedDataEncoder.hash(domain, types, value))).serialized;
  }
}
