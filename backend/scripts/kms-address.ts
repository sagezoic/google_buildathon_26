// Prints the Ethereum address of the Cloud KMS registrar key (CHAIN_KMS_KEY). Fund it with testnet ETH before deploying.
import { KmsSigner } from '../src/modules/chain/kms-signer';
import { env } from '../src/config/env';

if (!env.CHAIN_KMS_KEY) throw new Error('Set CHAIN_KMS_KEY to the cryptoKeyVersion resource name (see `terraform output chain_registrar_kms_key`).');
console.log(await new KmsSigner(env.CHAIN_KMS_KEY).getAddress());
