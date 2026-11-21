# Blockchain property tokens

Every property a lawyer approves gets one **non-transferable record token** on an EVM chain (Sepolia by default). The token holds hashes only. Documents stay in Cloud Storage, the mirror of each token lives in Cloud SQL, and the registrar signing key lives in Cloud KMS.

## How it works

```
upload docs ─► lawyer approves ─► POST /api/chain/properties/:id/approve (admin token)
                                    1. sha256 every document in Cloud Storage
                                    2. Merkle root over the hashes (sorted-pair keccak, OpenZeppelin-compatible)
                                    3. token metadata JSON ─► gs://<bucket>/chain/metadata/<tokenId>.json
                                    4. Cloud KMS (HSM) signs register() / update() ─► PropertyRegistry on-chain
                                    5. tx hash + block saved in property_tokens / property_token_txs
verify    ─► POST /api/chain/verify (file [+ propertyId]) ─► sha256 ─► manifest ─► Merkle proof ─► contract.verifyDocument()
```

| Thing | Where |
| :--- | :--- |
| Contract | `backend/contracts/PropertyRegistry.sol` (compiled to `src/modules/chain/PropertyRegistry.json` by `bun run chain:compile`) |
| Property id / token id | `keccak256(abi.encode(jurisdiction, parcel))` as `uint256`, e.g. `("IN-MH-PUNE-MAVAL-KUSGAON", "112/2")`. One parcel, one token. |
| On-chain record | `ownerRef` (salted hash, never a name), `docRoot`, `metadataHash`, lawyer `attestation` hash, `version`, `encumbered`, `status` |
| Token metadata | Cloud Storage `chain/metadata/`, served at `GET /api/chain/metadata/:tokenId.json` (`tokenURI` points here; no public bucket) |
| Off-chain mirror | Cloud SQL tables `property_tokens`, `property_token_txs` (chain of title: every register/update) |
| Registrar key | Cloud KMS HSM key `realdha-chain/property-registrar`, `EC_SIGN_SECP256K1_SHA256`, created by `terraform/chain.tf` |
| Secrets | Secret Manager: `CHAIN_RPC_URL`, `CHAIN_ADMIN_TOKEN`, `CHAIN_OWNER_SALT` |

Re-approving unchanged files returns the existing token. Changed or added files bump `version` through `update()`, and the old versions stay readable from event logs and `property_token_txs`.

## Demo properties

`bun run chain:seed-demo` creates the two demo properties the UI twins show (plot Gat 112/2 Kusgaon: `prop_demo_kusgaon_112_2`, apartment A-1804 Baner Heights: `prop_demo_baner_a1804`), with deterministic sample PDFs, and mints their tokens through the same approval path. It is idempotent. The Twin page (GP-16) and "Check a document" (GP-17) read the plot's live token and verify uploads against it. They fall back to the old fixtures until the token exists.

## Set up

Local:
```bash
cd backend
npx ganache --wallet.deterministic          # separate terminal
cp .env.example .env                        # CHAIN_* already point at ganache
bun run chain:deploy                        # prints CHAIN_CONTRACT_ADDRESS, paste into .env
bun run chain:seed-demo
```

Cloud (Sepolia):
1. Set the CI secrets `CHAIN_RPC_URL`, `CHAIN_ADMIN_TOKEN`, `CHAIN_OWNER_SALT` (`openssl rand -hex 32` each for the last two) and push. Terraform creates the KMS key, secrets, IAM and Cloud Run env. The CI service account needs `roles/cloudkms.admin` and `roles/secretmanager.admin`.
2. `terraform output chain_registrar_kms_key`, then `CHAIN_KMS_KEY=<that> bun run chain:address` prints the registrar's Ethereum address. Fund it with Sepolia ETH from a faucet.
3. `CHAIN_KMS_KEY=... CHAIN_RPC_URL=... PUBLIC_API_URL=<backend url> bun run chain:deploy`, then set the repo variable `CHAIN_CONTRACT_ADDRESS` (and `CHAIN_PUBLIC_API_URL`) and redeploy.
4. `bun run chain:seed-demo` against the Cloud SQL database.

## Review of the proposed plan

The plan's core is sound and is kept: hash documents off-chain and anchor only the hash, derive one deterministic id per parcel, restrict writes to a registrar role, never use a freely transferable NFT. These parts differ, for these reasons:

| Plan says | Implemented instead | Why |
| :--- | :--- | :--- |
| One `documentHash` per property | Merkle root over all documents; per-document proof | A Realdha file has 5+ documents (7/12, card, NA, mutation, deed). One hash cannot say which document matched or survive adding one. |
| `encryptedDocUri` on-chain | Nothing on-chain but hashes; URIs stay in Cloud Storage / SQL | A public chain is permanent and indexable. Storage paths and bucket names should not live there. |
| `owner` = wallet address | `ownerRef` = salted keccak of the owner identity | Realdha owners sign in with Google/phone, not wallets. A wallet-per-owner adds seed-phrase risk and links people to parcels publicly. |
| Challenge-response proof of wallet ownership | Not built. The lawyer attestation hash + KYC is the ownership check | Needs embedded wallets (ERC-4337, Privy/Web3Auth). Worth adding once owners hold wallets; the contract does not need to change. |
| Registrar = `msg.sender` deployer key | Registrar key in Cloud KMS HSM; only digests ever leave the app | A deployer private key in an env var is the single point of failure for the whole registry. |
| Owner transfer via same registrar call | Separate `changeOwner`, `setEncumbered`, `revoke` with events | Transfers, liens and revocation need distinct audit events for the chain of title. |
| `ULPIN` as parcel id | `district / taluka / village` + gat (survey) number | That is what the 7/12 extract gives today; ULPIN can replace `parcel` later. Inputs are normalised so `Rd` vs `Road` style drift cannot fork an id. |
| OpenZeppelin `AccessControl` | Small admin + registrar mapping | No dependency for two roles; swap in `AccessControl` if roles multiply. |
| Gasless UX via paymasters | Registrar pays gas; owners never transact | Same outcome with no ERC-4337 stack. |
| Private/consortium chain | Sepolia public testnet, hashes only | Matches the UI's "Sepolia testnet" proof panel. Salted `ownerRef` and hash-only data keep a public chain tolerable; revisit Besu/permissioned for production. |
| (missing) | Idempotent approval, per-property mutex, version history, lawyer attestation hash | Retries must not double-mint; the lawyer's sign-off needs to be provable. |

The plan's oracle-problem note applies fully: the chain proves a document is unchanged since the lawyer approved it, not that it was genuine on upload.

## Known gaps

- **Lawyer authentication.** GP-15 "Approve and anchor" calls `approve` for the demo plot when the ledger is configured. The lawyer types `CHAIN_ADMIN_TOKEN` into the page (kept in `sessionStorage`, never in the bundle). That is a shared secret, not per-lawyer identity; replace it with real lawyer login (Clerk skill is installed) before production.
- **Fractional tokenisation** (GP-19/20 units) is separate from this record token and is not implemented.
- **Multi-instance nonces.** Writes are serialised within one Cloud Run instance, so Terraform caps the backend at 1 instance while `enable_chain` is true. Move writes behind a queue before scaling out.
- **Revoke / encumbrance** exist on the contract but have no API routes yet.
- The `jsonb` columns written by drizzle's bun-sql driver are stored as JSON strings (existing behaviour); queries that look inside them must unwrap with `#>> '{}'`, as `ChainService.verifyFile` does.
