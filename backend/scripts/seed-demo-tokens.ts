// Mints tokens for the demo properties through the normal approval path. Idempotent. Run: bun run chain:seed-demo
import { seedDemoTokens } from '../src/modules/chain/demo';
import { closeDb } from '../src/db/client';

for (const r of await seedDemoTokens()) {
  console.log(`${r.propertyId}: ${r.changed ? 'anchored' : 'already anchored'} v${r.token.version} root ${r.token.docRoot} tx ${r.token.txHash}`);
}
await closeDb();
process.exit(0);
