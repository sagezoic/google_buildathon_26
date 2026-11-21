// Compiles contracts/PropertyRegistry.sol to src/modules/chain/PropertyRegistry.json (abi + bytecode). Run: bun run chain:compile
import solc from 'solc';
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync('contracts/PropertyRegistry.sol', 'utf8');
const out = JSON.parse(
  solc.compile(
    JSON.stringify({
      language: 'Solidity',
      sources: { 'PropertyRegistry.sol': { content: source } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        evmVersion: 'paris',
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
      },
    }),
  ),
);
const errors = (out.errors ?? []).filter((e: { severity: string }) => e.severity === 'error');
if (errors.length) {
  console.error(errors.map((e: { formattedMessage: string }) => e.formattedMessage).join('\n'));
  process.exit(1);
}
const c = out.contracts['PropertyRegistry.sol'].PropertyRegistry;
writeFileSync('src/modules/chain/PropertyRegistry.json', JSON.stringify({ abi: c.abi, bytecode: `0x${c.evm.bytecode.object}` }, null, 2) + '\n');
console.log('compiled', c.evm.bytecode.object.length / 2, 'bytes');
