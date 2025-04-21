### Repository bootstrap

- [ ] Create new Git repository (e.g. `gogetaction01`) and push an empty `main` branch to your remote (GitHub, GitLab, etc.)
- [ ] Add root‐level `.gitignore` for Node, React, Docker, & VS Code
- [ ] Add `LICENSE`, `README.md`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md`
- [ ] Create `.editorconfig`, `.prettierrc`, `.eslintrc.cjs`, and `.npmrc` to enforce code style & security audits
- [ ] Configure **commit hooks** with Husky + lint‑staged for auto‑linting on commit

### Top‑level directory layout

- [ ] `frontend/`        — React (Vite + TypeScript) SPA
- [ ] `backend/`         — Node micro‑services (gateway + workers)
- [ ] `infra/`           — Dockerfiles, Docker Compose, K8s manifests, Terraform
- [ ] `docs/`            — Living architecture docs, ADRs, API specs
- [ ] `scripts/`         — Dev & Ops helper scripts (bash/ts/node)
- [ ] `.github/`         — Pull‑request templates & GitHub Actions workflows
- [ ] `.vscode/`         — Recommended workspace settings & debug profiles

### Front‑end scaffold (`/frontend`)

- [ ] `npx create-vite@latest frontend --template react-ts`
- [ ] Add absolute import aliases via `tsconfig.json`
- [ ] Install UI tooling: Tailwind CSS, shadcn/ui, lucide‑react
- [ ] Configure React Router & Axios with Keycloak token‑refresh interceptor
- [ ] Add Cypress + Jest + React Testing Library
- [ ] Create `.env.example` with Vite environment variables

### API gateway (`/backend/api-gateway`)

- [ ] `npm init -y && pnpm add express zod jsonwebtoken`
- [ ] Create `/src/` folders: `routes`, `controllers`, `services`, `middlewares`, `config`
- [ ] Implement Keycloak JWT verifier middleware
- [ ] Add Jest & Supertest for integration tests
- [ ] Dockerfile (Alpine, non‑root user) and `Dockerfile.dev`
- [ ] Helm chart or K8s manifests for deployment

### Micro‑services (`/backend/services`)

- [ ] pdf-service/      — PDF Creator (Node + PDFKit)
- [ ] stripe-proxy/     — Secure Stripe bridge
- [ ] clicksend-proxy/  — SMS/Voice proxy
- [ ] email-proxy/      — SMTP relay wrapper
- [ ] For **each** service: `src/`, `tests/`, `Dockerfile`, `Dockerfile.dev`, `helm/` (or `k8s/`)
- [ ] Share common utilities via `/backend/libs`

### IAM & databases

- [ ] `/infra/keycloak/` → realm export JSON, theme resources, init‑scripts
- [ ] `/infra/postgres/` → init SQL, migration scripts (Flyway/Liquibase)
- [ ] `/infra/mongo/`    → seed data & migrations (Migrate‑Mongo)

### Containerization & local orchestration

- [ ] Write root‑level `docker-compose.yml` covering NGINX (OpenResty), Keycloak, Postgres, Mongo, all Node services, and the React dev server
- [ ] Add `docker-compose.override.yml` for local hot‑reload mounts
- [ ] Provide `Makefile` or `npm run dev:all` script to boot the full stack

### Kubernetes & cloud deploy

- [ ] `/infra/k8s/base/` → namespace, secrets, config‑maps, network policies
- [ ] `/infra/k8s/apps/` → Deployment, Service, Ingress (or Gateway API) YAMLs per component
- [ ] `/infra/helm/` → umbrella Helm chart if preferred over raw manifests
- [ ] Terraform or Pulumi module for GKE cluster & GCR registry

### CI / CD

- [ ] `.github/workflows/ci.yml` → lint, unit‐test, build Docker images
- [ ] `.github/workflows/cd.yml` → push images to GCR & apply K8s manifests
- [ ] Add Snyk/Dependabot config for dependency scanning
- [ ] Configure required status checks & branch protections in repository settings

### Documentation

- [ ] Move `software_architecture_document.md` into `docs/architecture/`
- [ ] Add ADR template and record initial Architecture Decision Records
- [ ] Publish API (OpenAPI 3) specs under `docs/api/`
- [ ] Generate Storybook for React components (`frontend/.storybook`)

### Developer experience

- [ ] VS Code debug configurations for front‑end, API gateway, and micro‑services
- [ ] Pre‑configured REST client (Thunder Client / HTTP file) examples
- [ ] `scripts/dev.sh` — single command to spin up local stack with TLS
- [ ] Add `conventional-changelog` and `commitlint` for semantic versioning

### Security hardening

- [ ] Create RENOVATE or Dependabot config for dependency updates
- [ ] Define Docker Bench & Trivy scans in CI
- [ ] Add `.gitleaks.toml` and integrate secret scanning in pre‑push hook
- [ ] Draft Threat‑Model document (`docs/security/threat-model.md`)

### Quality gates

- [ ] Enforce 80 %+ code coverage threshold in CI
- [ ] Integrate ESLint, Prettier, TS‑Strict, and SonarQube (optional)

### Kick‑off wrap‑up

- [ ] Verify `docker compose up` launches entire stack locally
- [ ] Push initial commit & open PR for team review
