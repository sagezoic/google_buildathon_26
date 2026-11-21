// Deploys PropertyRegistry with the configured signer (CHAIN_KMS_KEY or CHAIN_PRIVATE_KEY) and prints CHAIN_CONTRACT_ADDRESS.
import { deployRegistry, getSigner } from '../src/modules/chain/ledger';
import { metadataBaseUri } from '../src/modules/chain/service';

console.log('Deploying from registrar', await getSigner().getAddress());
const { address, txHash } = await deployRegistry(metadataBaseUri());
console.log(`CHAIN_CONTRACT_ADDRESS=${address}\ndeploy tx ${txHash}`);
