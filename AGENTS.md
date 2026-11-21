# AGENTS.md

Realdha (Google Buildathon 26): a monorepo with a Bun/Elysia API, a React UI, and Terraform that deploys both to Google Cloud Run.

## Layout

| Path | What | Stack |
| :--- | :--- | :--- |
| `backend/` | REST API (`src/app.ts` app, `src/index.ts` server + graceful shutdown, `src/routes/*`, `src/config/env.ts`) | Bun 1.4.5, Elysia, drizzle-orm, TypeScript |
| `realdha-ui/` | Frontend (`src/App.tsx`, `src/main.tsx`) served by nginx (`nginx.conf.template`, `BACKEND_URL` injected) | React 19, Vite, oxlint, npm |
| `terraform/` | Cloud Run v2 services, Artifact Registry, IAM, service accounts (`us-central1`, US regions only) | Terraform 1.9.5 |
| `.github/workflows/` | `deploy.yml` (CD on push to `main`), `terraform-plan.yml` (PR plan/lint) | GitHub Actions, Workload Identity Federation |
| `docs/` | `github-actions-setup.md` (secrets and WIF setup), `blockchain.md` (property tokens: design, setup, plan review) | |
| `.agents/skills/` | Installed agent skills (Bun, Clerk, Gemini, GCloud, Terraform, BigQuery, ...); tracked in `skills-lock.json` | |

## Commands

Backend (`cd backend`):
- `bun install`
- `bun run dev`: watch mode on port 8080
- `bun test`
- `bun run typecheck`
- Blockchain tokens: `bun run chain:compile | chain:deploy | chain:seed-demo | chain:address`. Details in `docs/blockchain.md`.

Frontend (`cd realdha-ui`):
- `npm ci`
- `npm run dev`
- `npm run lint`
- `npm run build`: runs `tsc -b` then `vite build`

Terraform (`cd terraform`):
- `terraform fmt -check`
- `terraform validate`
- `terraform plan`
- Copy `terraform.tfvars.example` to `terraform.tfvars`. Never commit the real tfvars.

## Backend conventions

- Add a route as `src/routes/<name>.ts`, exporting an `Elysia` instance. Mount it in `src/app.ts` with `.use()`.
- Give every route `detail: { summary, tags }` and a `response: t.Object(...)` schema. Register new tags in the swagger config in `app.ts`.
- Error shape is `{ error, message, code }`, set in the global `onError` in `app.ts`. Reuse it; don't hand-roll error bodies.
- Read config only through `src/config/env.ts`, not `process.env` directly. Cloud Run supplies `PORT` (default 8080).
- Keep `/health` stable: it is the Cloud Run probe.
- Gemini (Vertex AI) code is in `src/modules/ai/` (document checks, property chat) and `src/services/gemini.ts`. Models and location come from `VERTEX_LOCATION`, `GEMINI_VERIFY_MODEL` and `GEMINI_CHAT_MODEL`, set by Terraform (`terraform/vertex.tf`). Tests stub `GeminiService.generateJson`; never call Vertex from tests.
- Blockchain code is in `src/modules/chain/` (contract in `backend/contracts/`). Recompile with `bun run chain:compile` after editing the `.sol` and commit the JSON. Chain tests run an in-process ganache and need a database.
- Tests are in `backend/test/*.test.ts`, using `bun:test` against the exported `app`. Fixtures are in `backend/test/fixtures/`. Add a test with every route.
- ESM only (`"type": "module"`). Use `bun`, not npm/yarn, in `backend/`.

## Frontend conventions

- Use npm (`package-lock.json`). Lint with oxlint. TypeScript strict config is in `tsconfig.app.json`.
- Call the API through the nginx proxy or `BACKEND_URL`. Don't hardcode backend URLs.

## Deployment rules

- Pushes to `main` that touch `backend/`, `realdha-ui/`, `terraform/` or the deploy workflow trigger deploy. Don't push untested changes there.
- Both Dockerfiles must keep building. Check with `docker build` after changing dependencies or the entrypoint.
- Pin versions in CI to match local ones (Bun 1.4.5, Node 22, Terraform 1.9.5).
- Services run as least-privilege service accounts (`realdha-backend-sa`, `realdha-ui-sa`). Don't widen IAM without need.

## Working rules for agents

- Do not commit secrets, `.env`, `terraform.tfvars`, or state files.
- Change only what the task needs. Match existing style (2-space indent, single quotes, semicolons in the backend).
- Before finishing, run the relevant checks: `bun test` and `bun run typecheck` for the backend, `npm run lint` and `npm run build` for the UI, `terraform validate` for infra.
- Check `.agents/skills/` for a relevant skill before inventing a workflow. `bun-backend` is the one to use for backend work, and `terraform-*` / `google-cicd-terraform` for infra.
- `backend/tsconfig.tsbuildinfo` and `node_modules` are build output, not source.
