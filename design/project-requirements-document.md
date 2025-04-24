# Project Requirements Document (PRD) - v3.0

## 1. Introduction

### 1.1 Purpose

This document outlines the functional, non-functional, technical, and operational requirements for a new web application. The application will provide a platform enabling registered "Campaign Users" to create advocacy campaigns (requiring payment) and associated letter templates. Other "General Users" (anonymous or registered) can browse campaigns, select letters, provide recipient details, and pay via Stripe to have these letters physically mailed via ClickSend. The application prioritizes security, maintainability, user experience across devices, GDPR/CCPA compliance, and an efficient developer workflow, managed within a monorepo structure.

### 1.2 Scope

The scope includes the design, development, testing, and deployment of:

- A **responsive** React frontend UI (Vite, TypeScript, **Material UI**) handling **direct OIDC interactions with Keycloak**.

- A Node.js backend API (JavaScript, Express) handling business logic and **validating OIDC tokens received from the frontend**.

- **NGINX** as a secure reverse proxy.

- Identity and Access Management via **Keycloak**, configured for **user roles** and **brokering external Identity Providers (Facebook, Instagram, Email)**.

- Data persistence using MongoDB and PostgreSQL (for Keycloak).

- Microservices for PDF generation (Node.js/PDFKit), Stripe payments (Node.js), ClickSend integration (Node.js), and Email dispatch (Node.js/SMTP).

- Containerization (Docker, **Alpine Linux focus**) for all components.

- Deployment via **Kubernetes (GKE)** with detailed manifest requirements.

- A **monorepo** structure with defined tooling.

- Comprehensive testing strategy (Unit, Component, Integration, E2E).

- CI/CD pipelines using **GitHub Actions** with dependency scanning.

- Detailed development environment setup and **Developer Experience (DX)** enhancements.

### 1.3 Goals and Objectives

- **Security:** Implement OWASP Top 10 mitigations, secure OIDC flow, PCI DSS compliance, robust NGINX configuration.

- **Privacy:** Comply with GDPR and CCPA (consent, DSAR, data minimization, retention).

- **Usability:** Deliver an intuitive, **responsive** UI optimized for **desktop and mobile browsers**, leveraging **Material UI** for a consistent look and feel.

- **Maintainability:** Build modular, well-documented code within a **monorepo**, using **conventional commits** and automated changelogs.

- **Scalability:** Design for future horizontal scaling, starting with single replicas.

- **Reliability:** Ensure high availability via GKE deployment and backups.

- **Performance:** Deliver fast load times and responsive API interactions.

- **Developer Experience:** Provide a smooth, efficient local development setup, clear processes, and helpful tooling (single-command startup, debugging, testing, CI/CD).

### 1.4 Stakeholders

- Development Team

- Product Owner / Project Manager

- End Users:

  - **Campaign Users (Campaigners):** Registered users (via Keycloak, potentially brokered) who create campaigns and letter templates.

  - **General Users:** Users (anonymous or registered) who browse campaigns and send letters.

- Operations / DevOps Team

- Security Team

### 1.5 Assumptions

- Fee structures for campaign creation and letter sending are defined.

- Necessary third-party accounts/API keys (Stripe, ClickSend, Email Relay, GCP, Facebook Developer, Instagram Developer) are available.

- The team has expertise in the specified technologies.

- Initial user load is low, allowing for starting with single replicas.

## 2. Functional Requirements

### 2.1 User Roles and Management

- **FR-ROLE-001:** The system must support two primary user roles: Campaigner and General User.

- **FR-ROLE-002:** User roles **MUST** be managed within Keycloak using its role management features. The backend API **MUST** authorize access based on roles extracted from validated JWTs.

- **FR-ROLE-003:** The Campaigner role is required to access campaign creation, campaign editing, and letter template management functionalities.

- **FR-ROLE-004:** General User functionality (browsing, selecting letters, initiating send process) **MUST** be accessible to anonymous users. Optional registration might grant additional features later.

### 2.2 User Authentication and Authorization (OIDC Flow)

- **FR-AUTH-001:** Authentication **MUST** be handled using the OpenID Connect (OIDC) Authorization Code Flow.

- **FR-AUTH-002:** The **React Frontend MUST** initiate the OIDC login flow by redirecting the user to the Keycloak authorization endpoint when a Campaigner login is required.

- **FR-AUTH-003:** The Frontend **MUST** handle the redirect back from Keycloak, exchanging the authorization code for tokens (ID Token, Access Token, Refresh Token) at the Keycloak token endpoint. This exchange **MUST** happen securely (details TBD - typically backend handles code exchange, or frontend uses PKCE). **Decision: Use PKCE flow handled entirely by the frontend **

- **FR-AUTH-004:** The Frontend **MUST** securely manage the received tokens (e.g., store in memory, potentially use Refresh Token for silent renewal). ID/Access tokens **MUST NOT** be stored in localStorage or sessionStorage.

- **FR-AUTH-005:** For requests to protected backend API endpoints, the Frontend **MUST** include the Access Token in the Authorization: Bearer <token> header using fetch.

- **FR-AUTH-006:** The **Node.js Backend API MUST** implement middleware to protect specific routes. This middleware **MUST:**

  - Extract the Bearer token from the Authorization header.

  - Verify the token's signature against Keycloak's public keys (fetched from the JWKS URI).

  - Validate the token's issuer (iss), audience (aud), and expiry (exp).

  - Extract user information and roles from the validated token for use in authorization logic.

- **FR-AUTH-007:** Campaign Users **MUST** be able to log out. Logout **MUST** invalidate the session in the Frontend and redirect the user to Keycloak's end session endpoint to terminate the Keycloak session.

- **FR-AUTH-008:** Keycloak **MUST** provide password recovery/reset functionality for users registered directly via email.

### 2.3 Identity Brokering (Keycloak Configuration)

- **FR-IDP-001:** Keycloak **MUST** be configured as an identity broker.

- **FR-IDP-002:** Keycloak **MUST** be configured to allow users to authenticate via the following external Identity Providers (IdPs):

  - Facebook

  - Instagram

  - Email/Password (managed directly by Keycloak)

- **FR-IDP-003:** Appropriate Keycloak Identity Provider mappers **MUST** be configured to map attributes (like email, name) from external IdPs to Keycloak user profiles.

- **FR-IDP-004:** The Keycloak login screen **MUST** present options for users to choose their preferred authentication method (Facebook, Instagram, or Email/Password).

### 2.4 Campaign Management (for Campaign Users)

- **FR-CAMP-001:** Logged-in Campaign Users **MUST** be able to initiate the creation of a new campaign (providing details via a form: title, description, target goal [optional], etc.).

- **FR-CAMP-002:** Before final campaign creation, the Campaign User **MUST** complete a Stripe payment process.

- **FR-CAMP-003:** Upon successful payment, the campaign **MUST** be marked as active/created.

- **FR-CAMP-004:** Campaign Users **MUST** be able to view, edit, and potentially deactivate their own campaigns via the UI.

### 2.5 Letter Template Management (for Campaign Users)

- **FR-LTR-TMPL-001:** Campaign Users **MUST** be able to create, view, edit, and delete letter templates associated with their active campaigns. Templates include a name, subject, and body content.

### 2.6 Browsing and Letter Selection (for General Users)

- **FR-SEND-001:** All users **MUST** be able to browse/search active campaigns.

- **FR-SEND-002:** Users **MUST** be able to select a campaign and view its associated letter templates.

- **FR-SEND-003:** Users **MUST** be able to select one or more templates to send.

- **FR-SEND-004:** Users **MUST** provide recipient details (Name, Address fields) and sender address details via a form.

- **FR-SEND-005:** The system **MUST** calculate the cost based on the number of letters selected (template * recipient combinations).

- **FR-SEND-006:** Users **MUST** be directed to the Stripe payment flow to pay the calculated amount.

### 2.7 PDF Generation

- **FR-PDF-001:** The PDF Creator service **MUST** expose an HTTP POST endpoint accepting JSON data (template content, recipient details, sender details, date).

- **FR-PDF-002:** The service **MUST** use **PDFKit** to generate a distinct PDF for each recipient, merging dynamic data into a base template.

- **FR-PDF-003:** The service **MUST** return the generated PDF(s) (e.g., as base64 encoded strings or binary data) to the calling service.

### 2.8 Payment Processing (Stripe)

- **FR-PAY-001:** The Stripe Proxy service **MUST** expose endpoints to create Stripe Payment Intents for:

  - Campaign creation fees.

  - Letter sending costs.

- **FR-PAY-002:** The React Frontend **MUST** use Stripe.js and Material UI input components (styled appropriately) to securely collect payment details and confirm the Payment Intent using the client secret obtained from the Stripe Proxy.

- **FR-PAY-003:** The Stripe Proxy service **MUST** handle Stripe webhooks (e.g., payment_intent.succeeded, payment_intent.payment_failed) to reliably update application state (activate campaign, trigger letter sending). Webhook handling **MUST** be idempotent and secure (verify webhook signature).

- **FR-PAY-004:** Payment flows **MUST** provide clear user feedback (success, failure, processing).

### 2.9 ClickSend Integration

- **FR-CS-001:** The ClickSend Proxy service **MUST** expose an HTTP POST endpoint accepting recipient address details and the corresponding generated PDF letter(s).

- **FR-CS-002:** This endpoint **MUST** only be callable internally after successful payment confirmation for letter sending.

- **FR-CS-003:** The service **MUST** use the **ClickSend Post Letter API** (authenticating via API key) to submit the mailing request.

- **FR-CS-004:** The service **MUST** handle responses and potential errors from the ClickSend API.

### 2.10 Email Functionality

- **FR-EMAIL-001:** The Email Proxy service (or main backend) **MUST** handle sending transactional emails via a configured SMTP relay/API (e.g., SendGrid).

- **FR-EMAIL-002:** Emails include: Campaigner registration confirmation, password resets, payment receipts (campaign creation & letter sending).

- **FR-EMAIL-003:** Email sending **MUST** be triggered by backend logic (e.g., after successful registration, payment webhook processing).

## 3. Non-Functional Requirements

### 3.1 Security

- **NFR-SEC-001:** Mitigate OWASP Top 10 vulnerabilities through secure coding practices, input validation, output encoding, dependency scanning, and proper configuration.

- **NFR-SEC-002:** Enforce HTTPS for all external traffic via NGINX configuration (TLS 1.2+).

- **NFR-SEC-003:** Secure OIDC flow: Use PKCE, secure token handling in frontend (in-memory), robust backend token validation (signature, claims), secure Keycloak configuration (realm settings, client secrets).

- **NFR-SEC-004:** Secure NGINX Configuration:

- Implement SSL termination with strong ciphers and protocols.

  - Configure secure headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

  - Disable unnecessary modules and server information disclosure (server_tokens off).

  - Implement request limiting (rate limiting, connection limiting) to mitigate DoS/brute-force.

  - Configure proxy settings securely (proxy_set_header, etc.).

- **NFR-SEC-005:** Achieve and maintain PCI DSS v4.0 compliance for the payment flow components (Frontend payment elements, Stripe Proxy, Stripe interaction).

- **NFR-SEC-006:** Implement GDPR/CCPA requirements (Consent mechanisms, DSAR handling for Campaigners, data minimization, clear retention policies, privacy policy).

- **NFR-SEC-007:** Secure microservice communication (within Kubernetes cluster) using Network Policies. Consider mTLS via a service mesh if complexity increases significantly later.

- **NFR-SEC-008:** Store all secrets (API keys, passwords, client secrets) securely using Kubernetes Secrets integrated with GCP Secret Manager (or equivalent). **NEVER** commit secrets to version control.

- **NFR-SEC-009:** Regularly scan dependencies (npm audit, Snyk/Dependabot) and Docker images (GCR scanning, Trivy/Snyk) for vulnerabilities.

### 3.2 Performance

- **NFR-PERF-001:** Target API response times < 500ms (p95) under typical load.

- **NFR-PERF-002:** Target frontend Largest Contentful Paint (LCP) < 2.5s.

- **NFR-PERF-003:** Optimize frontend bundle size using Vite build optimizations, code splitting, and tree shaking.

- **NFR-PERF-004:** Implement appropriate database indexing (MongoDB, PostgreSQL) based on query patterns.

- **NFR-PERF-005:** Utilize NGINX caching for static assets and potentially Gzip compression.

### 3.3 Scalability

- **NFR-SCAL-001:** Initial deployment: Single replicas for stateless services. Design Kubernetes Deployments for easy scaling (replicas adjustment, HPA).

- **NFR-SCAL-002:** Databases: Use appropriately sized managed instances (Cloud SQL, MongoDB Atlas) or configure K8s StatefulSets allowing future scaling/replication.

### 3.4 Reliability

- **NFR-REL-001:** Target 99.9% uptime (excluding planned maintenance).

- **NFR-REL-002:** Deploy across multiple availability zones in GKE.

- **NFR-REL-003:** Implement automated daily backups for MongoDB and PostgreSQL with defined retention.

- **NFR-REL-004:** Implement readiness and liveness probes for all backend services in Kubernetes.

- **NFR-REL-005:** Implement graceful shutdown handling in Node.js services.

### 3.5 Maintainability

- **NFR-MAIN-001:** Adhere strictly to the **monorepo** structure defined in Section 4.4.

- **NFR-MAIN-002:** Enforce consistent code style (ESLint, Prettier) via pre-commit hooks (husky).

- **NFR-MAIN-003:** Follow **Conventional Commits specification** for all git commits (commitlint).

- **NFR-MAIN-004:** Automatically generate CHANGELOG.md using conventional-changelog-cli.

- **NFR-MAIN-005:** Write clear, concise code with comments for complex logic. Use TypeScript effectively in the frontend.

- **NFR-MAIN-006:** Structure backend code logically (e.g., routes, controllers, services, models).

- **NFR-MAIN-007:** Structure frontend code logically (e.g., features, components, hooks, services, layouts). Use absolute import aliases (@/components).

- **NFR-MAIN-008:** Maintain comprehensive documentation (READMEs per package, architecture decisions).

### 3.6 Usability & Accessibility

- **NFR-USE-001:** Implement a **responsive UI** using **Material UI** components and theming, adapting fluidly to desktop, tablet, and mobile viewports.

- **NFR-USE-002:** Ensure cross-browser compatibility (latest Chrome, Firefox, Safari, Edge) on desktop and mobile.

- **NFR-USE-003:** Follow WCAG 2.1 AA accessibility guidelines where feasible, leveraging Material UI's accessibility features. Provide ARIA attributes and keyboard navigation support.

- **NFR-USE-004:** Ensure intuitive navigation and clear user flows.

### 3.7 Testability

- **NFR-TEST-001:** Implement comprehensive automated testing strategy covering:

- **Unit Tests:** Jest (Backend logic, Frontend utils/hooks).

  - **Component Tests:** React Testing Library + Jest (Frontend components in isolation).

  - **Integration Tests:** Jest/Supertest (Backend API endpoints), potentially RTL/Jest for frontend service integrations.

  - **End-to-End (E2E) Tests:** Playwright (Key user flows simulating real browser interaction across different viewports).

- **NFR-TEST-002:** Aim for high test coverage targets (specific % TBD, e.g., >80% for critical logic).

- **NFR-TEST-003:** Integrate tests into the CI/CD pipeline; failures **MUST** block deployment.

### 3.8 Developer Experience (DX)

- **NFR-DX-001:** Provide a single command (scripts/dev.sh) to spin up the complete local development stack (all containers via Docker Compose) with hot-reloading and local TLS.

- **NFR-DX-002:** Configure VS Code debugging (launch.json) for easy step-through debugging of Frontend (browser), Backend API, and potentially other Node.js microservices.

- **NFR-DX-003:** Provide example HTTP request files (`.http` or `.rest`) for interacting with backend APIs using VS Code REST Client extension (or similar).

- **NFR-DX-004:** Implement pre-commit hooks (husky) for linting, formatting, and commit message validation (commitlint).

- **NFR-DX-005:** Ensure fast feedback loops (quick builds, fast tests, hot-reloading).

- **NFR-DX-006:** Maintain clear setup instructions and documentation within the monorepo.

## 4. System Architecture

### 4.1 High-Level Architecture Diagram (Mermaid)

```
graph TD
    subgraph User Device
        Client[Browser (Desktop/Mobile)]
    end

    subgraph Network Edge (GCP/Cloudflare)
        LB[Load Balancer / CDN Cloudflare]
    end

    subgraph GKE Cluster
        Ingress(Kubernetes Ingress) --> NginxProxy[NGINX Reverse Proxy <br/> Alpine Container]

        NginxProxy -- Serves Static Files --> FrontendApp(React UI Served by NGINX)
        NginxProxy -- Proxies /api --> BackendApi[Node.js Express API <br/> Alpine Container]

        subgraph Backend Services
            BackendApi -- CRUD Ops --> MongoDb[MongoDB <br/> Official Container]
            BackendApi -- Calls Service --> PdfCreator[PDF Creator Service <br/> Node.js / Alpine Container]
            BackendApi -- Calls Service --> StripeProxy[Stripe Proxy Service <br/> Node.js / Alpine Container <br/> PCI Scope]
            BackendApi -- Calls Service --> ClickSendProxy[ClickSend Proxy Service <br/> Node.js / Alpine Container]
            BackendApi -- Calls Service --> EmailProxy[Email Proxy Service <br/> Node.js / Alpine Container]
            %% Internal Service-to-Service via Axios
        end

        subgraph IAM Infrastructure
            Keycloak[Keycloak IAM <br/> Official Container] -- Stores Data --> PostgresDb[PostgreSQL <br/> Alpine Container]
        end

        %% Direct OIDC Communication (No NGINX Involvement in flow)
        FrontendApp -- OIDC Auth Flow Redirects/Token Req --> Keycloak
        BackendApi -- Validates Token (JWKS Fetch) --> Keycloak
    end

    subgraph External Services
        StripeProxy -- API Calls (Axios) --> Stripe(Stripe API)
        ClickSendProxy -- API Calls (Axios) --> ClickSend(ClickSend API - Post Letter)
        EmailProxy -- Relays Mail (Axios/SMTP Lib) --> EmailRelay(Email Relay Service <br/> e.g., SendGrid/Mailgun API/SMTP)
        Keycloak -- Brokering Auth Flow --> FacebookIdp(Facebook API)
        Keycloak -- Brokering Auth Flow --> InstagramIdp(Instagram API)
    end

    Client -- HTTPS --> LB
    LB -- HTTPS --> Ingress
```

content_copydownload

Use code [with caution](https://support.google.com/legal/answer/13505487).Mermaid

### 4.2 Component Descriptions

- **Client:** User's web browser on desktop or mobile. Interacts with the React frontend.

- **Load Balancer / CDN:** (GCP LB / Cloudflare) Edge termination, DDoS protection, CDN.

- **Kubernetes Ingress:** Routes external traffic to the NGINX service within the cluster. Handles SSL termination using cluster-managed certificates.

- **NGINX Reverse Proxy:**

- Based on nginx:alpine image.

  - **Responsibilities:** SSL termination (if not done at Ingress), routing requests to frontend static files or backend API (/api prefix), serving frontend static files efficiently, applying security headers, Gzip compression, rate limiting. **Does NOT handle OIDC logic.**

- **React UI (FrontendApp):**

- Built with Vite, TypeScript, **Material UI**.

  - **Handles OIDC Authorization Code Flow with PKCE** using keycloak-js adapter. Manages tokens securely (in memory).

  - Includes bearer tokens in API requests to the backend using fetch.

  - Implements responsive layouts using MUI components and grid system.

  - Containerized (multi-stage build node:alpine -> static files served by NGINX).

- **Node.js Express API (BackendApi):**

- Built with Node.js (JavaScript), Express.

  - **Validates JWT Bearer tokens** received from Frontend using libraries like jsonwebtoken, jwks-rsa. Checks signature against Keycloak's JWKS endpoint. Validates claims (iss, aud, exp).

  - Implements business logic, interacts with MongoDB, orchestrates calls to other microservices using axios.

  - Containerized (node:alpine).

- **Keycloak IAM:**

  - Official quay.io/keycloak/keycloak image.

    - Manages users, roles (Campaigner), clients (frontend, backend). **Configured for IdP Brokering** (Facebook, Instagram, Email).

    - Provides OIDC endpoints (authorization_endpoint, token_endpoint, jwks_uri, end_session_endpoint). Uses PostgreSQL.

- **PostgreSQL (PostgresDb):**

  - postgres:alpine image. Stores Keycloak data.

- **MongoDB (MongoDb):**

  - mongo:latest image. Stores application data (Campaigns, Templates, User Profiles [linked via Keycloak ID]). GDPR/CCPA considerations for data storage/retention.

- **PDF Creator Service:** node:alpine + **PDFKit**. Generates PDFs via HTTP POST.

- **Stripe Proxy Service:** node:alpine. Creates Payment Intents, handles Stripe webhooks securely. PCI Scope. Uses axios for Stripe API calls.

- **ClickSend Proxy Service:** node:alpine. Interfaces with ClickSend Post Letter API via axios.

- **Email Proxy Service:** node:alpine. Sends transactional emails via SMTP/API using axios or nodemailer.

### 4.3 Monorepo Strategy

- **Requirement:** The entire application (frontend, backend API, microservices, shared libraries, configs) **MUST** be managed within a single Git repository (monorepo).

- **Tooling:** Utilize npm workspaces or pnpm workspaces for managing dependencies and running scripts across packages. Consider Nx or Turborepo for enhanced caching, build orchestration, and dependency graph visualization if complexity warrants it later. **Initial Recommendation: Use **

- **Benefits:** Simplified dependency management, easier code sharing, atomic commits across related packages, consistent tooling setup.

### 4.4 Proposed Directory Structure (using pnpm workspaces)

```
/ (monorepo root)
├── .git/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
│       ├── ci.yml
│       └── deploy-staging.yml
│       └── deploy-prod.yml
├── .husky/                 # Husky pre-commit hooks config
├── .vscode/                # VS Code settings & debug configs
│   └── launch.json
├── certs/                  # Local development TLS certificates (generated, .gitignored)
├── docs/                   # Architecture decisions, setup guides
├── infra/
│   └── k8s/                # Kubernetes manifests (base, overlays for envs)
│       ├── base/
│       │   ├── nginx-deployment.yaml
│       │   ├── frontend-configmap.yaml # Served by nginx
│       │   ├── backend-api-deployment.yaml
│       │   ├── backend-api-service.yaml
│       │   ├── pdf-creator-deployment.yaml
│       │   # ... other base manifests (services, deployments, statefulsets, secrets) ...
│       │   └── kustomization.yaml
│       ├── overlays/
│       │   ├── development/
│       │   ├── staging/
│       │   └── production/
│       └── Tiltfile        # Optional: For local Kubernetes dev (Tilt)
├── packages/               # Individual applications and libraries
│   ├── frontend/           # React UI application
│   │   ├── public/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── Dockerfile
│   ├── backend-api/        # Main Node.js Express API
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── pdf-creator/        # PDF generation microservice
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── stripe-proxy/       # Stripe microservice
│   │   # ... structure similar to backend-api ...
│   ├── clicksend-proxy/    # ClickSend microservice
│   │   # ... structure similar to backend-api ...
│   ├── email-proxy/        # Email microservice
│   │   # ... structure similar to backend-api ...
│   └── shared-types/       # Optional: Shared TypeScript types/interfaces
│       ├── src/
│       └── package.json
├── scripts/                # Utility scripts
│   ├── dev.sh              # Start local dev environment
│   ├── setup-certs.sh      # Script to generate local TLS certs (e.g., using mkcert)
│   └── setup-hooks.sh      # Script to setup git hooks via husky
├── .commitlintrc.js        # Commitlint configuration
├── .dockerignore           # Global dockerignore
├── .editorconfig
├── .env.example            # Example environment variables
├── .eslintignore
├── .eslintrc.js            # Root ESLint config (can be overridden per package)
├── .gitignore
├── .lintstagedrc.js        # Lint-staged config for pre-commit hooks
├── .prettierignore
├── .prettierrc.js
├── docker-compose.yml      # Docker Compose for local development
├── Jenkinsfile             # Optional: If using Jenkins instead of GH Actions
├── LICENSE
├── package.json            # Root package.json (for devDependencies like husky, commitlint, workspaces config)
├── pnpm-lock.yaml          # pnpm lock file
├── pnpm-workspace.yaml     # Defines pnpm workspace packages
├── README.md               # Monorepo root README
└── tsconfig.base.json      # Optional: Base TypeScript config shared across packages
```

content_copydownload

Use code [with caution](https://support.google.com/legal/answer/13505487).

## 5. Technology Stack

| Category | Technology/Tool | Version/Spec | Rationale/Notes |
|----------|----------------|--------------|-----------------|
| **Monorepo Management** | **pnpm workspaces** | Latest | Efficient dependency management, linking. |
| **Frontend Framework** | React | Latest stable (18+) | Industry standard, component-based. |
| **Frontend Language** | TypeScript | Latest | Static typing, improved maintainability. |
| **Frontend Build Tool** | Vite | Latest | Fast HMR, optimised builds. |
| **Frontend UI Library** | **Material UI (MUI)** | Latest (v5+) | Comprehensive component library, theming, icons, accessibility focus. |
| **Frontend Routing** | React Router | Latest (v6+) | Standard routing solution for React SPAs. |
| **Frontend State Mgt** | React Context / Zustand / Redux Toolkit | TBD based on complexity | Start simple (Context), scale if needed. |
| **Frontend HTTP Client** | **API (Browser built-in)** | N/A | Modern standard, no extra dependency. Wrapper recommended for ergonomics. |
| **Frontend OIDC Client** | keycloak-js | Latest | Official Keycloak adapter for browser OIDC flows (PKCE). |
| **Backend Runtime** | Node.js | Latest LTS (e.g., 20.x) | Event-driven, non-blocking I/O. |
| **Backend Language** | **JavaScript (ES Modules)** | ES2022+ | Leverage modern JS features. |
| **Backend Framework** | Express.js | Latest (4.x) | Minimalist, widely used Node.js web framework. |
| **Backend HTTP Client** | **axios** | Latest | Promise-based HTTP client for Node.js (service-to-service calls). |
| **Backend JWT Validation** | jsonwebtoken, jwks-rsa | Latest | Standard libraries for validating JWTs against JWKS endpoint. |
| **Reverse Proxy** | **NGINX** | Latest (nginx:alpine image) | High-performance reverse proxy, load balancer, static file server. |
| **IAM** | Keycloak | Latest (quay.io image) | OIDC Provider, User Management, **IdP Brokering**. |
| **Databases** | MongoDB | Latest (mongo image) | NoSQL DB for flexible application data. |
| **Databases** | PostgreSQL | Latest (postgres:alpine image) | Relational DB for Keycloak. |
| **PDF Generation** | Node.js + **PDFKit** | Node LTS, PDFKit latest | Programmatic PDF generation, suitable for templates. |
| **Payment Gateway** | Stripe | API latest | Payment processing. Use stripe-node SDK in proxy. |
| **Communication Service** | ClickSend | Post Letter API latest | Physical letter mailing. Use axios in proxy. |
| **Email Service** | SendGrid / Mailgun / etc. | API/SMTP latest | Transactional email delivery. Use SDK or nodemailer + axios. |
| **Containerisation** | Docker | Latest | Container runtime. |
| **Container Orchestration** | Google Kubernetes Engine (GKE) | Latest stable | Managed K8s on GCP. |
| **Container Registry** | Google Container Registry (GCR) | N/A | Private Docker image storage. |
| **CI/CD** | **GitHub Actions** | N/A | Automation for build, test, scan, deploy integrated with GitHub. |
| **Linting/Formatting** | ESLint, Prettier | Latest | Code quality and formatting tools. |

## 6. Data Management

- **MongoDB:** Stores Campaigns, Letter Templates, potentially anonymized usage data. Requires Mongoose schemas, appropriate indexing, GDPR/CCPA compliant retention for any PII traces. Consider fields for campaignCreationPaymentStatus.

  - **PostgreSQL:** Stores Keycloak data (Users [linked to app profiles via ID], Roles, Clients, IdP configs). Managed by Keycloak. Regular backups essential.

  - **Data Migration:** Use a migration tool/scripts (e.g., migrate-mongo) for managing MongoDB schema changes.

  - **Backup Strategy:** Automated daily backups for PostgreSQL (Cloud SQL point-in-time recovery or K8s snapshots) and MongoDB (Managed service backups or K8s volume snapshots). Define retention policies (e.g., 7-30 days). Test restore procedures periodically.

  - **GDPR/CCPA:** Implement consent management (cookie banners, terms acceptance), DSAR process for Campaigners (data access/export/deletion via Keycloak/app), data minimization (collect only needed address fields), strict retention/deletion policies for General User PII (recipient/sender addresses - delete after mail confirmed sent + grace period, e.g., 30 days). Document all PII processing.

## 7. Security Requirements (Detailed)

(Combines previous OWASP section with new specifics)

- **Authentication/Authorization:**

  - Strictly follow OIDC Authorization Code Flow with PKCE via keycloak-js.

  - Backend **MUST** validate JWT signature using Keycloak's JWKS endpoint and validate iss, aud, exp claims on every protected request.

  - Implement Role-Based Access Control (RBAC) based on Keycloak roles in backend API routes/controllers.

  - Configure Keycloak securely: Strong password policies, brute force detection, secure realm/client settings, rotate client secrets if used (though backend client likely public with PKCE).

- **Input Validation:**

  - Validate all incoming data on the backend API (request bodies, query params, path params) using libraries like express-validator or zod. Reject invalid requests early.

  - Sanitize data before using it in database queries (Mongoose helps), external API calls, or PDF generation.

- **Output Encoding:**

  - Leverage React/MUI's built-in XSS protection. Avoid dangerouslySetInnerHTML.

  - Encode data appropriately if displayed in non-standard contexts.

- **NGINX Configuration:** See NFR-SEC-004 for details (TLS, Headers, Rate Limiting, Info Hiding).

- **Secret Management:** Use K8s Secrets (populated via build pipeline/GCP Secret Manager) mounted as environment variables or files. See Section 11.

- **PCI DSS:** Isolate Stripe Proxy service network-wise where possible. Ensure secure handling of Payment Intents. Adhere to all relevant PCI DSS v4.0 requirements.

- **Dependency Management:** Integrate pnpm audit and Snyk/Dependabot scans into CI pipeline. Fail builds on critical vulnerabilities. Maintain an update/patching process.

- **Container Security:** Use minimal Alpine base images, run containers as non-root users (USER directive in Dockerfile), remove unnecessary packages, scan images. Use K8s securityContext.

- **Network Security:** Utilize K8s Network Policies to restrict pod-to-pod communication based on least privilege. Control ingress and egress traffic.

- **Logging & Monitoring:** Log security-relevant events (auth success/failure, access denied, payment processing, admin actions). Monitor for anomalies and alert on suspicious activity.

- **GDPR/CCPA:** Implement technical measures supporting privacy requirements (see Section 6).

## 8. Deployment and Operations

### 8.1 Containerization Strategy

- **Requirement:** Each application component (Frontend [served by NGINX], Backend API, Microservices, Keycloak, Databases) **MUST** run in its own Docker container.

- **Base Images:** Use official **Alpine Linux** variants where available and stable (nginx:alpine, node:alpine, postgres:alpine). Use official non-Alpine if necessary (mongo:latest, quay.io/keycloak/keycloak).

- **Dockerfiles:**

- Utilize multi-stage builds to minimize final image size (e.g., build frontend/backend in a Node stage, copy artifacts to final Alpine stage).

  - Run processes as a non-root user (USER node or similar).

  - Include health check instructions (HEALTHCHECK).

  - Minimize layers and clean up build artifacts.

- **.dockerignore:** Use effectively to exclude unnecessary files (node_modules, .git, *.log, local configs) from the build context.

- **Registry:** Store images in **GCR**. Tag images appropriately (e.g., git SHA, semantic version).

### 8.2 Kubernetes Manifests Requirements

- **Location:** Store manifests under infra/k8s/. Use kustomize with base and overlays (development, staging, production) for environment-specific configurations.

- **Required Objects:**

- Namespace: Define namespaces for organization (e.g., app-staging, app-production).

  - Deployment: For stateless services (NGINX, Backend API, Microservices). Include:

  - replicas (starting at 1, defined per overlay).

    - selector and template.metadata.labels.

    - template.spec.containers: Image, ports, env vars (from ConfigMaps/Secrets), volume mounts, resource requests/limits (cpu, memory), readiness/liveness probes (httpGet or tcpSocket), securityContext (runAsNonRoot: true, allowPrivilegeEscalation: false).

  - StatefulSet: For stateful services deployed in K8s (MongoDB, PostgreSQL - if not using managed GCP services). Includes volumeClaimTemplates.

  - Service: To expose Deployments/StatefulSets internally (ClusterIP) or externally (LoadBalancer - usually managed by Ingress).

  - Ingress: To manage external access (e.g., Nginx Ingress Controller). Define rules for routing traffic to the NGINX service, configure TLS using cert-manager or GCP Managed Certificates.

  - ConfigMap: To store non-sensitive configuration data, mounted as files or env vars. Managed per environment overlay.

  - Secret: To store sensitive data (API keys, passwords), base64 encoded. Managed per environment overlay, potentially integrated with external secret managers (like GCP Secret Manager via CSI driver).

  - PersistentVolumeClaim (PVC): For StatefulSets.

  - NetworkPolicy: To restrict network traffic between pods based on labels.

  - HorizontalPodAutoscaler (HPA): Define later for auto-scaling based on CPU/memory or custom metrics.

- **Best Practices:** Use clear labels, annotations, define resource requests/limits, implement probes.

### 8.3 CI/CD Implementation (GitHub Actions)

- **Location:** .github/workflows/.

- **Triggers:** On push/merge to main (deploy staging), on tag creation (deploy production), on pull request (build, test, lint, scan).

- **Workflow (**

- actions/checkout@v4

  - Setup PNPM (pnpm/action-setup)

  - Install dependencies (pnpm install --frozen-lockfile)

  - Lint checks (pnpm lint)

  - Unit/Component/Integration Tests (pnpm test)

  - E2E Tests (pnpm test:e2e - might run conditionally or in separate workflow)

  - Dependency Vulnerability Scan (pnpm audit, Snyk Action / github/codeql-action/analyze, Dependabot integration). **Fail workflow on critical/high severity vulnerabilities.**

  - Build applications (pnpm build -r or specific package builds).

- **Workflow (deploy-staging.yml on merge to main):**

  1.  Checkout code.

  2.  Authenticate to GCP/GCR (google-github-actions/auth).

  3.  Build and push Docker images for each service (docker/build-push-action), tag with Git SHA.

  4.  Authenticate to GKE cluster.

  5.  Deploy/Apply Kubernetes manifests using kustomize build infra/k8s/overlays/staging | kubectl apply -f -.

- **Workflow (deploy-prod.yml on tag creation):**

  1.  Similar to staging, but:

  2.  Triggered by tag (e.g., v\*.\*.\*).

  3.  Build/push Docker images tagged with the Git tag.

  4.  Uses production overlay: kustomize build infra/k8s/overlays/production | kubectl apply -f -.

- **Secrets:** Use GitHub Actions encrypted secrets for GCP credentials, API keys needed during build/deploy.

## 9. Development Environment Setup (Local)

### 9.1 Docker Compose Configuration (docker-compose.yml)

- **Requirement:** Define all services (frontend dev server, nginx, backend api, microservices, keycloak, postgres, mongo) in docker-compose.yml.

- **Services:**

  - frontend: Runs Vite dev server (pnpm dev), mounts packages/frontend/src for hot-reloading. Exposes Vite port (e.g., 5173). Depends on backend-api.

  - backend-api: Runs Node.js API (pnpm dev), mounts packages/backend-api/src for hot-reloading (using nodemon). Exposes API port. Depends on mongo, postgres, other proxies.

  - Microservices (pdf, stripe, clicksend, email): Similar setup to backend-api with source code mounts and dev scripts.

  - nginx: Uses official nginx:alpine image. Mounts local NGINX config file (nginx.conf), local frontend build (for testing prod-like serving if needed, though dev usually hits Vite server directly), and local TLS certs. Proxies requests to frontend:5173 or backend-api:PORT. Exposes port 80/443.

  - keycloak: Uses quay.io/keycloak/keycloak. Configured with start-dev or start command. Environment variables for admin user, DB connection (pointing to postgres service), hostname. Mount volume for realm imports (/opt/keycloak/data/import). Exposes port 8080. Depends on postgres.

  - postgres: Uses postgres:alpine. Environment variables for Keycloak DB user/pass/db name. Mount named volume for data persistence.

  - mongo: Uses mongo:latest. Mount named volume for data persistence.

- **Networking:** Services communicate using service names as hostnames on the default Docker bridge network.

- **Environment Variables:** Load variables from .env file using env_file property or directly in compose file for non-sensitive defaults.

### 9.2 Local TLS Setup

- **Requirement:** Local development **MUST** run over HTTPS to mirror production and support secure cookies/features.

- **Tooling:** Use mkcert to generate locally trusted certificates.

- Run mkcert -install (once per machine).

  - Generate certs for localhost (and potentially custom dev domains): mkcert localhost 127.0.0.1 ::1 -> creates localhost*.pem files.

- **Integration:**

- Store generated .pem files in certs/ (gitignore this directory).

  - Mount certs/ volume into the NGINX container.

  - Configure NGINX server block to listen on 443 SSL and use the mounted certificate/key files (ssl_certificate, ssl_certificate_key).

  - Configure Vite dev server (vite.config.ts) to use the same certificates for its HTTPS server (if accessing Vite directly).

- **Script:** Provide scripts/setup-certs.sh to automate mkcert generation.

### 9.3 Single Command Startup (scripts/dev.sh)

- **Requirement:** A single script to launch the entire local development environment.

- **Implementation (dev.sh):**

  ```
  #!/bin/bash
  set -e # Exit on error

  # Ensure certificates exist, prompt to run setup if not
  if [ ! -f "./certs/localhost.pem" ]; then
    echo "Local certificates not found. Please run 'scripts/setup-certs.sh' first."
    # exit 1 # Option 1: Exit
    ./scripts/setup-certs.sh # Option 2: Run setup automatically
  fi

  echo "Starting development environment via Docker Compose..."
  docker compose up --build -d # Build images if needed, run in detached mode

  echo "Environment started."
  echo "Access Frontend (via NGINX): https://localhost"
  echo "Access Keycloak Admin: http://localhost:8080 (admin/secret)" # Adjust port if needed
  # Add other relevant access points

  # Optional: Tail logs of specific services
  # docker compose logs -f frontend backend-api
  ```

### 9.4 Tooling & Configuration

- **EditorConfig (** Define basic coding style rules (indentation, line endings).

- **Prettier (** Configure code formatting rules. Integrate with ESLint (eslint-config-prettier).

- **ESLint (** Configure linting rules for TypeScript (frontend) and JavaScript (backend). Use relevant plugins (React, TypeScript, Node).

- **Husky + lint-staged (** Configure pre-commit hooks to run linters, formatters, and potentially tests on staged files.

- **Commitlint (** Configure rules to enforce Conventional Commits format using Husky commit-msg hook.

- **VS Code (** Recommend extensions (ESLint, Prettier, Docker, Remote-Containers, Playwright, REST Client), configure format-on-save.

- **PNPM:** Use pnpm for all package management commands within the monorepo.

### 9.5 VS Code Debugging (.vscode/launch.json)

- **Requirement:** Provide configurations for debugging key services.

- **Configurations:**

  - **Frontend (Chrome/Edge):** Launch browser against https://localhost (or Vite port) with source maps enabled.

  - **Backend API (Node.js Attach):** Attach debugger to the Node.js process running inside the backend-api Docker container (requires exposing debug port, e.g., 9229, from container and using nodemon --inspect=0.0.0.0:9229). Use restart: true for auto-reconnecting with nodemon.

  - **Microservices (Node.js Attach):** Similar attach configurations for other Node.js services if needed.

  - **E2E Tests (Playwright):** Configuration to run Playwright tests with debugging enabled.

### 9.6 REST Client Examples (_.http / _.rest)

- **Requirement:** Provide example requests for common backend API endpoints.

- **Location:** Place files like requests/campaigns.http or similar.

- **Content:** Include requests for GET, POST, PUT, DELETE operations, showing required headers (e.g., Content-Type, placeholder for Authorization: Bearer {{token}}) and example request bodies. Use variables for hostname, tokens.

## 10. Testing Strategy (Detailed)

### 10.1 Unit Testing

- **Frontend:** Use **Jest** and **React Testing Library (RTL)**. Focus on testing individual utility functions, custom hooks, and simple components in isolation. Mock external dependencies (API calls, libraries).

- **Backend:** Use **Jest**. Focus on testing individual functions/modules (services, utils) in isolation. Mock database interactions and external API calls (axios).

- **Location:** tests directory within each package (frontend/tests, backend-api/tests, etc.). Files typically named *.test.ts or *.test.js.

- **Execution:** Run via pnpm test command, configured in root and package package.json.

### 10.2 Component Testing (Frontend)

- **Framework:** Use **Jest** and **React Testing Library (RTL)**.

- **Focus:** Test individual React components or small groups of components, verifying rendering, user interactions (clicks, form input), and state changes based on props. Mock necessary context providers or service calls.

- **Location:** Co-located with components (src/components/MyComponent/MyComponent.test.tsx) or in a dedicated tests folder.

### 10.3 Integration Testing

- **Backend API:** Use **Jest** combined with **Supertest**. Spin up an instance of the Express app in memory, send actual HTTP requests to its endpoints, and assert responses. Mock database layer or use a dedicated test database container.

- **Frontend:** Can involve testing interactions between multiple components using RTL, potentially mocking API responses via tools like msw (Mock Service Worker).

- **Location:** tests/integration folder within relevant packages.

### 10.4 End-to-End (E2E) Testing

- **Framework:** Use **Playwright**.

- **Scope:** Test critical user flows from start to finish in a real browser environment (targeting Chromium, Firefox, WebKit). Interact with the UI as a user would.

  - Examples: Campaigner registers -> logs in -> creates campaign -> pays -> creates letter template. General user browses -> selects letter -> provides details -> pays -> (verify backend state/mocked external calls).

- **Environment:** Run against a fully running local stack (via docker compose) or a dedicated staging environment. Requires handling authentication flows (potentially seeding test users in Keycloak or using test credentials).

- **Configuration:** Setup Playwright config (playwright.config.ts), define base URL, browser targets, potentially parallel execution.

- **Location:** Separate E2E test package (packages/e2e-tests) or within frontend/tests/e2e.

### 10.5 Test Execution in CI

- All test suites (unit, component, integration, E2E) **MUST** be executable via pnpm scripts and integrated into the GitHub Actions ci.yml workflow. E2E tests might run as a separate job or stage due to longer execution time.

## 11. Configuration Management

### 11.1 Environment Variables

- **Requirement:** Externalize all configuration that varies between environments (local, staging, production) or contains sensitive data.

- **Mechanism:** Use **environment variables**.

### 11.2 Local Development (.env file)

- **Requirement:** Use a .env file at the monorepo root to store configuration for the local Docker Compose environment.

- **Loading:** docker-compose.yml loads variables from the .env file using env_file: .env or directly referencing variables ${VAR_NAME}.

- **`.env.example`:**

  - **Requirement:** Provide an .env.example file in the root directory, listing all required environment variables with placeholder or default values. **NEVER** commit the actual .env file.

    - **Content Example (**

    ```
    # App Environment
    NODE_ENV=development

    # Frontend (via Vite - MUST be prefixed with VITE_)
    VITE_API_BASE_URL=https://localhost/api
    VITE_KEYCLOAK_URL=https://localhost:8080 # NGINX proxies Keycloak? Or direct? Update based on final NGINX setup
    VITE_KEYCLOAK_REALM=myrealm
    VITE_KEYCLOAK_CLIENT_ID=myfrontend-client
    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY

    # Backend API
    PORT=5000
    CORS_ORIGIN=https://localhost # Or Vite port if NGINX not proxying frontend in dev
    MONGODB_URI=mongodb://mongo:27017/myappdb
    KEYCLOAK_URL=http://keycloak:8080 # Internal Docker network URL for backend validation
    KEYCLOAK_REALM=myrealm
    # KEYCLOAK_BACKEND_CLIENT_SECRET= # Potentially not needed if backend is public client validating tokens
    STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET
    STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
    CLICKSEND_USERNAME=your_clicksend_username
    CLICKSEND_API_KEY=YOUR_CLICKSEND_API_KEY
    # PDF_SERVICE_URL=http://pdf-creator:5001 # Internal service URLs
    # STRIPE_SERVICE_URL=http://stripe-proxy:5002
    # CLICKSEND_SERVICE_URL=http://clicksend-proxy:5003
    # EMAIL_SERVICE_URL=http://email-proxy:5004

    # Email Service / SMTP Relay
    EMAIL_FROM_ADDRESS="noreply@example.com"
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=user@example.com
    SMTP_PASS=your_smtp_password

    # Keycloak Admin
    KEYCLOAK_ADMIN=admin
    KEYCLOAK_ADMIN_PASSWORD=secret

    # PostgreSQL (for Keycloak)
    POSTGRES_DB=keycloak
    POSTGRES_USER=keycloak
    POSTGRES_PASSWORD=securepassword # Change this!

    # Add other microservice-specific variables as needed
    ```

- **Frontend Access:** Frontend code (Vite) can only access environment variables prefixed with VITE_. These are embedded during the build process and are **publicly visible**. Do not put secrets here.

### 11.3 Staging/Production (Kubernetes)

- **Non-Sensitive Config:** Use **Kubernetes ConfigMaps**. Create separate ConfigMaps for each environment (via Kustomize overlays). Mount values as environment variables or files into containers.

- **Sensitive Config:** Use **Kubernetes Secrets**. Create secrets (e.g., using kubectl create secret generic ... --from-literal=... or from files) per environment. Mount values as environment variables or files. **Strongly recommend integrating with GCP Secret Manager** using the Secrets Store CSI Driver for more secure secret injection. Never store plain secrets in Git.

## 12. External Integrations (Detailed)

- **Stripe:**

  - Requires Publishable Key (VITE_STRIPE_PUBLISHABLE_KEY - public) and Secret Key (STRIPE_SECRET_KEY - secret). Webhook Secret (STRIPE_WEBHOOK_SECRET - secret) needed for verifying webhook events.

  - Frontend uses Stripe.js with Publishable Key.

  - Stripe Proxy uses Secret Key via stripe-node SDK (using axios is less common than SDK). Handles Payment Intents and Webhooks. Must be PCI DSS compliant.

- **ClickSend:**

  - Requires Username (CLICKSEND_USERNAME - potentially sensitive) and API Key (CLICKSEND_API_KEY - secret).

  - ClickSend Proxy uses credentials with axios to call the Post Letter API. GDPR/CCPA apply to address data transferred.

- **Email Relay (SendGrid/etc.):**

  - Requires API Key or SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - secrets).

  - Email Proxy (or Backend) uses credentials with SDK or nodemailer. Requires domain verification (SPF, DKIM) for deliverability.

- **Keycloak:**

  - Frontend (keycloak-js): Needs Keycloak URL, Realm, Client ID (VITE_KEYCLOAK_... - public).

  - Backend (Token Validation): Needs Keycloak URL, Realm (KEYCLOAK_... - non-secret) to fetch JWKS keys and verify token issuer.

- **Facebook/Instagram IdP Brokering:**

  - Requires setting up Developer Apps on Facebook/Meta platform.

  - Obtain App ID and App Secret for each.

  - Configure these credentials securely within Keycloak's Identity Provider settings for Facebook/Instagram. Keycloak handles the OAuth flow with these platforms.

## 13. Implementation Checklist / Task Breakdown

**(High-level phases, detailed tasks within each)**

**Phase 0: Project Setup & Foundation (Sprint 0)**

- Initialize Git repository.

- Set up monorepo structure (pnpm workspaces, directories).

- Configure root package.json, pnpm-workspace.yaml.

- Configure basic linting/formatting (ESLint, Prettier) at root.

- Configure Husky, lint-staged, commitlint for pre-commit/commit-msg hooks (scripts/setup-hooks.sh).

- Configure Conventional Changelog.

- Set up basic .gitignore, .dockerignore, .editorconfig.

- Create initial README.md.

- Set up .vscode settings, extensions recommendations.

- Create initial docker-compose.yml with core services (Postgres, Mongo, Keycloak).

- Configure basic Keycloak realm, admin user via Docker Compose env vars.

- Implement local TLS setup (mkcert, scripts/setup-certs.sh).

- Create basic scripts/dev.sh.

- Create .env.example.

- Set up basic GitHub Actions workflow for CI (ci.yml - checkout, install, basic lint).

**Phase 1: Authentication & Core Backend/Frontend Setup**

- Scaffold Frontend package (npx create-vite@latest frontend --template react-ts).

  - Configure tsconfig.json (paths aliases @/*).

  - Install and configure React Router.

  - Install and setup **Material UI (MUI)** core, icons. Configure basic theme provider.

  - Install keycloak-js.

  - Implement basic layouts (Header, Footer, Main Content area) using MUI, responsive structure.

  - Implement basic public/protected route structure using React Router.

  - Implement Keycloak initialization and login/logout flow triggering using keycloak-js.

  - Setup basic state management for auth status.

  - Create wrapper/utility for fetch to automatically add Auth header.

- Scaffold Backend API package (packages/backend-api).

  - Initialize Node.js project (pnpm init), install Express, Axios, etc.

  - Setup basic Express server structure (app.js/server.js, routes, controllers, services).

  - Implement health check endpoint (/healthz).

  - Implement JWT validation middleware using jsonwebtoken, jwks-rsa targeting Keycloak JWKS endpoint.

  - Create example protected API route.

  - Configure basic CORS settings.

  - Setup Mongoose and connect to MongoDB container.

- Configure Keycloak Realm:

  - Create Realm (myrealm).

  - Create Frontend client (myfrontend-client, public, standard flow, configure redirect URIs: https://localhost/*).

  - Create Backend client (mybackend-client, public/bearer-only - for audience check).

  - Create Campaigner role.

  - Configure IdP Brokering for Email (default), Facebook, Instagram (requires dev app setup on platforms).

- Update Docker Compose (frontend, backend-api services, Keycloak realm import).

- Update dev.sh, .env.example.

- Implement basic unit/integration tests for backend auth middleware.

- Implement basic component tests for frontend login/routing components.

- Update CI workflow to include tests for frontend/backend.

- Configure NGINX service in Docker Compose to proxy frontend dev server and backend API, apply local TLS.

**Phase 2: Core Feature Implementation (Campaigns, Letters, Payment)**

- Backend: Implement Campaign CRUD API endpoints (protected for Campaigners). Define Mongoose schema.

- Backend: Implement Letter Template CRUD API endpoints (protected). Define Mongoose schema.

- Frontend: Implement Campaign creation/editing forms using MUI components.

- Frontend: Implement Letter Template creation/editing forms using MUI components.

- Backend: Scaffold Stripe Proxy service. Implement endpoint to create Payment Intent (for campaign creation fee).

- Frontend: Integrate Stripe.js Elements with MUI for campaign creation payment form. Handle payment confirmation flow.

- Backend: Implement Stripe Webhook handler in Stripe Proxy (securely validate signature). Update Campaign status on payment_intent.succeeded.

- Frontend: Implement campaign browsing/viewing for General Users.

- Frontend: Implement letter selection and recipient/sender address forms for General Users.

- Backend: Implement API endpoint to calculate letter sending cost.

- Backend: Update Stripe Proxy to create Payment Intent for letter sending cost.

- Frontend: Implement Stripe payment flow for letter sending.

- Backend: Scaffold PDF Creator service. Implement PDF generation endpoint using PDFKit.

- Backend: Scaffold ClickSend Proxy service. Implement endpoint to call ClickSend Post Letter API.

- Backend: Implement logic to: validate letter payment (via webhook) -> generate PDFs -> call ClickSend Proxy.

- Backend: Scaffold Email Proxy service (or integrate into backend). Implement email sending logic for receipts/notifications.

- Add relevant unit, integration, and E2E tests (Playwright) for these core flows.

- Update Docker Compose for new microservices. Update .env.example.

- Configure VS Code debug for microservices. Add REST client examples.

**Phase 3: GDPR/CCPA, Testing Refinement, DX Polish**

- Implement GDPR/CCPA features: Consent mechanisms, update Privacy Policy, implement data retention logic (especially for General User addresses), document DSAR process for Campaigners.

- Refine and expand test coverage (unit, component, integration, E2E) across all packages. Setup Playwright project structure.

- Polish UI/UX based on testing and feedback, ensure responsiveness across target devices. Ensure MUI theming is consistent.

- Refine dev.sh script, VS Code debug configs, REST client examples.

- Ensure Conventional Commits are being followed, CHANGELOG.md generated correctly.

**Phase 4: Production Preparation & Deployment**

- Create Kubernetes manifests (infra/k8s/base and overlays).

  - Define Deployments, Services, Ingress, ConfigMaps, Secrets structures.

  - Configure probes, resource limits, security contexts.

  - Setup Network Policies.

  - Configure persistent volumes for databases (if not using managed).

  - Integrate secret management (e.g., GCP Secret Manager CSI driver).

- Refine Dockerfiles for production (multi-stage builds, security hardening).

- Build and test production Docker images.

- Set up GCR repository.

- Set up GKE cluster (staging, production environments).

- Configure DNS, SSL certificates (cert-manager or managed) for staging/production domains.

- Implement GitHub Actions deployment workflows (deploy-staging.yml, deploy-prod.yml) using Kustomize.

- Configure production Keycloak settings (disable dev mode, secure admin access, potentially HA setup).

- Configure production database backups and monitoring.

- Set up GCP Cloud Logging/Monitoring (or alternatives). Configure alerts.

- Perform security audit/penetration testing (optional but recommended).

- Deploy to Staging environment. Perform thorough testing (including E2E).

- Deploy to Production environment. Monitor closely.

## 14. Future Considerations

- **Service Mesh (Istio/Linkerd):** For advanced mTLS, traffic management, observability as microservice count grows.

- **Distributed Tracing (Jaeger/Tempo):** Track requests across services for debugging.

- **Caching (Redis):** Improve performance for frequently accessed, non-volatile data.

- **Advanced Scalability:** Database read replicas, CQRS pattern if write/read loads diverge significantly.

- **Feature Expansion:** User registration for General Users, saved drafts, send history, admin roles, image uploads, advanced templates, Campaigner-defined recipient lists.

- **Alternative Monorepo Tools:** Evaluate Nx or Turborepo if build/test performance becomes a bottleneck.

## 15. Appendices

### 15.1 Development Environment Setup

Please establish a consistent, secure, and efficient local development environment, including core tooling, project structure, basic service configurations (via Docker Compose), and initial DX enhancements, ready for feature implementation on the initial-setup branch. Please use the following table to assist you with determining the tasks involved:

| Task ID | Task Description | Reason for Task | Expected Outcome |
|---------|------------------|-----------------|------------------|
| **1. System Prerequisites Verification & Setup** | | | |
| 1.1 | **Verify/Install Homebrew:** Open Terminal, run brew --version. If command not found or error, install Homebrew following official instructions (/bin/bash -c "$(curl ...)"). Run brew doctor after install/verification. | Homebrew is the standard macOS package manager needed to easily install/manage other tools (like Git, mkcert if needed). | brew --version outputs a version number. brew doctor outputs "Your system is ready to brew." or only minor warnings. |
| 1.2 | **Verify/Install Git:** Run git --version. If not found, run brew install git. | Git is essential for version control: cloning the repository and managing code changes. | git --version outputs a version number (macOS often includes a base version, brew ensures a more recent one). |
| 1.3 | **Verify/Install nvm:** Run command -v nvm. If command not found, install nvm using the official install script (`curl -o- ... | bash`). Close and reopen terminal. | nvm allows managing multiple Node.js versions, ensuring the project uses the required LTS version without system conflicts. | |
| 1.4 | **Verify/Install Project Node.js LTS:** Check nvm ls for the project's target LTS version (e.g., 20.x). If not present, run nvm install --lts. Run node --version and npm --version. | Ensures the correct Node.js runtime and compatible npm version are used for consistency with CI/CD and team members. | node --version outputs the target LTS version (e.g., v20.12.2). npm --version outputs the corresponding npm version (e.g., 10.5.0). nvm current shows the LTS version selected. |
| 1.5 | **Set Default Node.js LTS:** Run nvm alias default lts/* (or specific version, e.g., nvm alias default 20). Close and reopen terminal. Verify with nvm current. | Makes the project's Node.js version the default for new terminal sessions, avoiding manual nvm use commands. | Opening a new terminal shows the correct LTS version immediately via nvm current. |
| 1.6 | **Verify/Install PNPM:** Run pnpm --version. If not found, enable Corepack (corepack enable) and use it or install pnpm globally via npm install -g pnpm. | pnpm is the chosen package manager for the monorepo, required for dependency installation and workspace management. | pnpm --version outputs a version number (e.g., 8.x or 9.x). |
| 1.7 | **Verify Docker Desktop:** Check if Docker Desktop application is running. Run docker --version and docker compose version. | Docker is essential for running the containerized application services locally. Docker Compose orchestrates these containers. | Docker Desktop icon visible and indicates running state. docker --version outputs a Docker version. docker compose version outputs a Docker Compose version. docker info runs without errors indicating the daemon is active. |
| 1.8 | **Verify:** Run mkcert --version. If not found, run brew install mkcert. | mkcert is needed to generate locally trusted TLS/SSL certificates required for local HTTPS development. | mkcert --version outputs a version number. |
| 1.9 | **Install:** Run mkcert -install. | Installs the mkcert root CA into system/browser trust stores, making locally generated certificates trusted (no browser warnings). | Command executes successfully (may prompt for admin password). Confirmation message shown. |
| 1.10 | **Verify VS Code:** Check if VS Code application is installed. Run code --version. If command not found, open VS Code, open Command Palette (Cmd+Shift+P), search for "Shell Command: Install 'code' command in PATH". | VS Code is the IDE. The code command allows opening the project from the terminal easily. | VS Code application exists. code --version outputs VS Code version details. |
| **2. Project Initialization & Monorepo Setup** | | | |
| 2.1 | **Clone Project Repository:** In your preferred development directory, run git clone https://github.com/jroberts101/gogetaction.git. | Obtains the initial (likely minimal) project codebase from the remote GitHub repository. | A directory named gogetaction is created containing the repository files (e.g., .git folder, maybe a README). |
| 2.2 | **Navigate to Project Root:** Run cd gogetaction. | Positions the terminal within the project directory for subsequent commands. | Terminal prompt indicates the current working directory is the gogetaction project root. |
| 2.3 | **Checkout Target Branch:** Run git checkout initial-setup (or git checkout -b initial-setup if it doesn't exist remotely yet and needs to be created locally first). | Ensures all subsequent work is performed on the correct branch designated for initial setup tasks. | git branch --show-current outputs initial-setup. |
| 2.4 | **Create Root:** Run pnpm init -y (or create manually). Edit the file. | Initializes the project root as a Node.js package, required for managing root-level dev dependencies and pnpm workspaces. | package.json file exists at the root. Set "private": true. Remove "main": "index.js". Add basic info (name, version 0.1.0). |
| 2.5 | **Create:** Create the file pnpm-workspace.yaml at the root. | Defines the locations of the individual packages within the monorepo for pnpm. | pnpm-workspace.yaml file exists with content like: packages:\n - 'packages/*' |
| 2.6 | **Create Core Directories:** Run mkdir packages scripts docs infra certs .github .vscode. | Establishes the fundamental directory structure outlined in the PRD for organizing code, configs, scripts, and infrastructure manifests. | Directories packages, scripts, docs, infra, certs, .github, .vscode exist at the project root. |
| 2.7 | **Create:** Create a .gitignore file at the root. | Prevents committing sensitive or unnecessary files/directories (.env, node_modules, build artifacts, OS files, certs, etc.) to version control. | .gitignore file exists. Add common Node/OS ignores, plus .env, node_modules/, dist/, build/, coverage/, certs/_.pem, .DS_Store, _.log. |
| 2.8 | **Create:** Create a .editorconfig file at the root. | Defines basic coding styles (indentation, line endings) enforced across different editors/IDEs. | .editorconfig file exists with project standards (e.g., indent_style = space, indent_size = 2, end_of_line = lf, charset = utf-8). |
| **3. Root Tooling Installation & Configuration** | | | |
| 3.1 | **Install Root Dev Dependencies:** Run pnpm add -D -w typescript eslint prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional conventional-changelog-cli concurrently nodemon @types/node. | Installs essential development tools at the root level (-w flag) needed for linting, formatting, Git hooks, commit conventions, and running services. | Dependencies are added to devDependencies in the root package.json and installed in the root node_modules. pnpm-lock.yaml is updated. |
| 3.2 | **Configure ESLint:** Create .eslintrc.js at the root. Create .eslintignore. | Sets up baseline linting rules. Ignores files/dirs not meant to be linted (e.g., build output). | .eslintrc.js exists with basic configuration (e.g., extends recommended rules, parser options, prettier plugin). .eslintignore exists listing node_modules, dist, build, etc. |
| 3.3 | **Configure Prettier:** Create .prettierrc.js and .prettierignore at the root. | Defines code formatting rules. Ignores files/dirs not meant to be formatted. | .prettierrc.js exists with project's formatting preferences (e.g., semi: true, singleQuote: true, tabWidth: 2). .prettierignore exists listing node_modules, dist, pnpm-lock.yaml, etc. |
| 3.4 | **Configure Commitlint:** Create .commitlintrc.js at the root. | Configures rules for validating commit messages against the Conventional Commits standard. | .commitlintrc.js exists, typically extending @commitlint/config-conventional (module.exports = { extends: ['@commitlint/config-conventional'] };). |
| 3.5 | **Configure lint-staged:** Create .lintstagedrc.js at the root. | Configures which commands (linting, formatting) run on which staged files via the pre-commit hook. | .lintstagedrc.js exists, defining rules like running eslint --fix and prettier --write on staged .ts, .tsx, .js files. |
| 3.6 | **Configure Husky:** Run pnpm husky install (or npx husky install). Run npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'. Run npx husky add .husky/pre-commit 'npx lint-staged'. Ensure hook files are executable (chmod +x .husky/*). | Initializes Husky and creates Git hook scripts (commit-msg, pre-commit) that trigger commitlint and lint-staged respectively. | .husky directory exists with executable commit-msg and pre-commit hook files containing the specified commands. |
| **4. Core Package Scaffolding** | | | |
| 4.1 | **Scaffold Frontend Package:** Run pnpx create-vite@latest packages/frontend --template react-ts. cd packages/frontend then pnpm install. cd ../... | Creates the basic React/TypeScript frontend application structure using the Vite template within the monorepo's packages directory. Installs its specific dependencies. | packages/frontend directory exists with Vite/React/TS structure (src, public, index.html, package.json, tsconfig.json, etc.). packages/frontend/node_modules exists. |
| 4.2 | **Configure Frontend:** Edit packages/frontend/tsconfig.json. | Adds path aliases (e.g., @/*) for cleaner imports within the frontend codebase. | compilerOptions in tsconfig.json includes "baseUrl": "." and "paths": { "@/*": ["src/*"] }. |
| 4.3 | **Install Frontend Core Libs:** cd packages/frontend. Run pnpm add react-router-dom @mui/material @emotion/react @emotion/styled @mui/icons-material keycloak-js. cd ../... | Installs essential libraries for routing, UI components (Material UI), and Keycloak OIDC integration into the frontend package. | Dependencies are added to packages/frontend/package.json and installed in packages/frontend/node_modules. |
| 4.4 | **Scaffold Backend API Package:** Run mkdir packages/backend-api. cd packages/backend-api. Run pnpm init -y. cd ../... | Creates the directory and initial package.json for the main backend API service within the monorepo. | packages/backend-api directory exists with a basic package.json. |
| 4.5 | **Install Backend Core Libs:** cd packages/backend-api. Run pnpm add express cors dotenv mongoose axios jsonwebtoken jwks-rsa. Run pnpm add -D nodemon. cd ../... | Installs essential libraries for the Express web server, CORS handling, environment variables, MongoDB interaction (Mongoose), HTTP calls (Axios), JWT validation, and development auto-restarts (nodemon). | Dependencies are added to packages/backend-api/package.json and installed. |
| 4.6 | **Create Backend Basic Structure:** Create packages/backend-api/src directory and basic files (e.g., src/server.js or src/app.js, src/routes/health.js). | Establishes the initial source code structure for the backend API. | packages/backend-api/src exists containing a minimal Express server setup file and a basic health check route (/healthz). |
| 4.7 | **Add Basic Backend:** Edit packages/backend-api/package.json. | Defines npm scripts to run the backend server in production mode (start) and development mode with hot-reloading (dev using nodemon). | scripts section in package.json includes "start": "node src/server.js" and "dev": "nodemon src/server.js". |
| **5. Docker & Local Environment Setup** | | | |
| 5.1 | **Create Frontend:** Create packages/frontend/Dockerfile. | Defines how to build the production Docker image for the frontend (static files). | packages/frontend/Dockerfile exists. Contains multi-stage build: Stage 1 uses node:alpine to pnpm install and pnpm build. Stage 2 uses nginx:alpine, copies built files from Stage 1 into NGINX HTML directory (/usr/share/nginx/html), exposes port 80. |
| 5.2 | **Create Backend:** Create packages/backend-api/Dockerfile. | Defines how to build the production Docker image for the backend API. | packages/backend-api/Dockerfile exists. Uses node:alpine. Copies package.json, pnpm-lock.yaml. Runs pnpm install --prod. Copies src. Sets CMD ["node", "src/server.js"]. Exposes backend port (e.g., 5000). Sets USER node. |
| 5.3 | **Create:** Create docker-compose.yml at the root. | Defines all the services (app components, databases, Keycloak, NGINX), their images, ports, volumes, dependencies, and environment variables for local development orchestration. | docker-compose.yml exists. Contains service definitions for nginx, frontend (using Vite dev server, mounting code), backend-api (using nodemon, mounting code), keycloak, postgres, mongo. Includes port mappings, volume mounts for code syncing, dependencies (depends_on), env_file: .env. |
| 5.4 | **Create Basic NGINX Config:** Create nginx.conf (or default.conf) locally (e.g., infra/docker/nginx/default.conf). Mount this into the nginx service in docker-compose.yml. | Provides the initial NGINX configuration for local development: listening on 443, using local TLS certs, proxying requests to frontend dev server or backend API. | nginx.conf file exists. Contains a server block listening on 443 SSL, referencing mounted certs (/etc/nginx/certs/localhost.pem), with location /api { proxy_pass http://backend-api:5000; ... } and location / { proxy_pass http://frontend:5173; ... }. |
| 5.5 | **Create:** Create .env.example file at the root (as detailed in PRD Section 11.2). | Provides a template for all required environment variables for the local setup, ensuring developers know what needs to be configured. | .env.example file exists at the root, listing variables for ports, database credentials, Keycloak admin, API keys (with placeholders like pk_test_YOUR_STRIPE_KEY) |
| 5.6 | **Generate Local TLS Certs:** Run mkdir certs (if not done). Run mkcert -key-file ./certs/localhost-key.pem -cert-file ./certs/localhost.pem localhost 127.0.0.1 ::1. Ensure certs/*.pem is in .gitignore. | Generates the actual certificate files needed by NGINX/Vite, trusted locally due to Step 1.9. | localhost-key.pem and localhost.pem files exist in the certs/ directory. |
| 5.7 | **Create:** Create scripts/dev.sh (as detailed in PRD Section 9.3). Make it executable (chmod +x scripts/dev.sh). | Provides the single command to easily start the entire local development stack via Docker Compose. | scripts/dev.sh exists, is executable, and contains the logic to check certs and run docker compose up --build -d. |
| **6. VS Code DX Enhancements:** | | | |
| 6.1 | **Create VS Code:** Create .vscode/settings.json. | Configures workspace-specific VS Code settings like enabling format-on-save and specifying default formatters/linters. | .vscode/settings.json exists. Contains "editor.formatOnSave": true, "editor.defaultFormatter": "esbenp.prettier-vscode", potentially ESLint settings. |
| 6.2 | **Create VS Code:** Create .vscode/extensions.json. | Recommends specific VS Code extensions to new team members opening the project, ensuring consistent tooling. | .vscode/extensions.json exists. Contains a recommendations array listing extension IDs (e.g., dbaeumer.vscode-eslint, esbenp.prettier-vscode, ms-azuretools.vscode-docker). |
| 6.3 | **Create VS Code:** Create .vscode/launch.json. | Defines debug configurations for attaching to running Node.js services (backend, microservices) inside Docker and debugging frontend code in the browser. | .vscode/launch.json exists. Contains configurations (stubs initially) for "Attach to Backend API", "Launch Chrome against localhost", etc. (Requires refinement once services are running and ports known). |
| **7. Initial Verification (Post-Setup)** | | | |
| 7.1 | **Create Local:** Run cp .env.example .env. Review and potentially update default passwords/placeholders in .env. | Creates the actual environment file used by docker compose. Ensures sensitive defaults aren't immediately used if review is needed. | .env file exists at the root. |
| 7.2 | **Run Startup Script:** Execute ./scripts/dev.sh. | Starts all containers defined in docker-compose.yml using the generated certs and .env configuration. | Script completes without errors. docker ps shows all expected services running. |
| 7.3 | **Verify NGINX & Frontend Access:** Open https://localhost in browser. | Confirms NGINX is proxying correctly to the frontend dev server and TLS is working without browser warnings. | The default Vite/React template page loads successfully over HTTPS. |
| 7.4 | **Verify Backend API Access:** Open https://localhost/api/health (or the path to the health check) in browser or use REST client. | Confirms NGINX is proxying correctly to the backend API service and the basic backend server is responding. | Receives a success response (e.g., {"status": "ok"} or similar) from the backend health check endpoint. |
| 7.5 | **Verify Keycloak Access:** Open http://localhost:8080 in browser. Log in with admin credentials from .env. | Confirms Keycloak container started correctly and is accessible. | Keycloak Admin Console login page loads. Login is successful. |
| 7.6 | **Commit Initial Setup:** Run git add ., git commit -m "chore: initial project setup and tooling configuration". Push branch git push -u origin initial-setup. | Checks initial project setup code and configuration into the repo. | Initial project code and configuration is present in the repo |

### 15.2 Functional Requirements Table

| Requirement ID | Description | User Stories | Expected Behaviour/Outcome |
|----------------|-------------|--------------|----------------------------|
| **User Roles & Management** | | | |
| FR-ROLE-001 | Define and manage Campaigner and General User roles within Keycloak. | As a System Administrator, I want roles defined in Keycloak so that application permissions can be assigned based on these roles. | **Expected Behaviour/Outcome:** Keycloak realm (myrealm) contains roles named Campaigner. General Users might not have an explicit role assigned initially or might have a default role if registered later. Verification: Check Keycloak Admin Console for role existence. |
| FR-ROLE-002 | Authorize backend API requests based on roles extracted from validated JWT Access Tokens. | As a Backend Developer, I want to check user roles from the JWT so that I can restrict access to specific API endpoints (e.g., campaign creation). | **Expected Behaviour/Outcome:** Backend API middleware intercepts requests to protected routes. It validates the JWT (see FR-AUTH-006) and extracts the realm_access.roles or resource_access.<client_id>.roles claim. If the required role (e.g., Campaigner) is present, the request proceeds; otherwise, a 403 Forbidden response is returned. Verification: Test protected endpoints with tokens containing/lacking the required role. |
| FR-ROLE-003 | Restrict access to Campaign/Letter management UI components and API routes to users authenticated with the Campaigner role. | As a Campaigner, I want exclusive access to campaign/letter management tools so that only authorized users can modify campaign content. | **Expected Behaviour/Outcome:** Frontend UI (using React Router and auth state) conditionally renders management components/routes only if the user is authenticated and has the Campaigner role (from Keycloak token). Backend API endpoints for campaign/letter CRUD operations return 403 Forbidden if the validated token lacks the Campaigner role. Verification: Attempt access as anonymous user and as Campaigner. |
| FR-ROLE-004 | Allow anonymous users access to public functionalities (browsing campaigns, initiating letter sending). | As a General User, I want to browse campaigns and start sending letters without logging in so that the process is quick and easy. | **Expected Behaviour/Outcome:** Frontend UI routes for browsing campaigns and viewing letter templates are publicly accessible. Backend API endpoints for fetching public campaign data do not require authentication. Verification: Access public sections of the site while not logged in. |
| **Authentication & Authorization (OIDC)** | | | |
| FR-AUTH-001 | Implement OIDC Authorization Code Flow for Campaigner authentication. | As a Campaigner, I want a standard and secure way to log in to manage my campaigns. | **Expected Behaviour/Outcome:** Frontend uses OIDC standard flow. Triggering login redirects the browser to Keycloak's /auth endpoint with parameters like client_id, redirect_uri, scope=openid email profile roles, response_type=code, and PKCE parameters (code_challenge, code_challenge_method). Verification: Observe browser redirect to Keycloak. |
| FR-AUTH-002 | Frontend initiates OIDC login flow via redirect to Keycloak's authorization endpoint. | As a Frontend Developer, I want to use the keycloak-js adapter to initiate the login sequence when required. | **Expected Behaviour/Outcome:** User action (e.g., clicking "Login" or accessing a protected route) triggers keycloak.login() via the keycloak-js adapter. The browser is redirected to the Keycloak URL constructed by the adapter. Verification: Browser network trace shows redirect to Keycloak /auth endpoint. |
| FR-AUTH-003 | Frontend handles redirect from Keycloak, uses keycloak-js to exchange authorization code for tokens via PKCE at Keycloak's token endpoint. | As a Frontend Developer, I want the keycloak-js adapter to handle the code-to-token exchange securely using PKCE after the user authenticates at Keycloak. | **Expected Behaviour/Outcome:** After successful authentication at Keycloak, the browser is redirected back to the application's redirect_uri. The keycloak-js adapter detects the code parameter in the URL, automatically makes a POST request to Keycloak's /token endpoint including the code, redirect_uri, client_id, grant_type=authorization_code, and PKCE code_verifier. Verification: Browser network trace shows POST to /token endpoint and subsequent removal of code from URL. |
| FR-AUTH-004 | Frontend securely manages OIDC tokens (ID, Access, Refresh) in memory using keycloak-js adapter. | As a Frontend Developer, I want tokens handled securely by the adapter without storing them insecurely (like localStorage). | **Expected Behaviour/Outcome:** keycloak-js adapter stores tokens internally (in memory). Provides methods (keycloak.token, keycloak.idToken, keycloak.refreshToken) to access them. Automatically handles token refresh using the refresh token if configured. Tokens are **not** visible in localStorage or sessionStorage. Verification: Inspect browser storage; inspect keycloak object in dev tools (if possible). |
| FR-AUTH-005 | Frontend includes Access Token in Authorization: Bearer header for protected backend API requests using fetch. | As a Frontend Developer, I want API requests to protected backend endpoints to be automatically authenticated using the current Access Token. | **Expected Behaviour/Outcome:** When making fetch requests to configured backend API endpoints, the Authorization header is added with the value Bearer ${keycloak.token}. This might involve interceptors or wrapper functions around fetch. Verification: Inspect outgoing fetch requests in browser network tools for correct header presence and valid token. |
| FR-AUTH-006 | Backend API middleware validates incoming JWT Access Tokens (signature, issuer, audience, expiry) against Keycloak's JWKS endpoint. | As a Backend Developer, I want to ensure that incoming tokens are valid and issued by the correct Keycloak instance for the intended audience before processing requests. | **Expected Behaviour/Outcome:** Middleware uses jwks-rsa to fetch Keycloak's public keys from its JWKS URI (/.well-known/openid-configuration). Uses jsonwebtoken verify() function with the fetched key, correct issuer URL, audience (backend client ID), and checks expiry. Valid tokens allow request processing; invalid tokens result in 401 Unauthorized response. Verification: Send requests with valid, expired, invalid signature, wrong issuer/audience tokens and check responses. |
| FR-AUTH-007 | Implement logout functionality invalidating frontend session and redirecting to Keycloak's end session endpoint. | As a Campaigner, I want to securely log out of the application and Keycloak simultaneously. | **Expected Behaviour/Outcome:** Clicking "Logout" triggers keycloak.logout(). keycloak-js clears local tokens/state and redirects the browser to Keycloak's /end_session_endpoint with id_token_hint and post_logout_redirect_uri. Keycloak clears its session and redirects back to the application's specified post-logout URI. Verification: Observe browser redirects and confirm user is logged out of Keycloak (accessing Keycloak account console should require login again). |
| FR-AUTH-008 | Keycloak provides password recovery/reset for users registered via email/password. | As a Campaigner who registered via email, I want to be able to reset my password if I forget it. | **Expected Behaviour/Outcome:** Keycloak's built-in login theme includes a "Forgot Password?" link. Following this flow allows users to receive a password reset email (requires Keycloak SMTP configuration). Verification: Test the "Forgot Password" flow on the Keycloak login page. |
| **Identity Brokering (Keycloak)** | | | |
| FR-IDP-001 | Configure Keycloak realm (myrealm) to enable Identity Brokering. | As a System Administrator, I want Keycloak configured to allow logins via external providers. | **Expected Behaviour/Outcome:** Keycloak Realm settings allow identity brokering. Verification: Check relevant settings in Keycloak Admin Console -> Realm Settings. |
| FR-IDP-002 | Configure specific Identity Providers (Facebook, Instagram, Email/Password) within Keycloak. | As a System Administrator, I want Facebook, Instagram, and Email/Password set up as login options in Keycloak. | **Expected Behaviour/Outcome:** Keycloak Admin Console -> Identity Providers shows configured entries for Facebook and Instagram, each with Client ID and Client Secret obtained from the respective platforms. Email/Password is implicitly enabled. Verification: Presence and configuration details in Keycloak Admin Console. Test login via IdP and verify attributes in Keycloak User profile. |
| FR-IDP-003 | Configure attribute mapping from external IdPs (Facebook, Instagram) to Keycloak user profiles (e.g., email, name). | As a System Administrator, I want user details from Facebook/Instagram to be automatically populated in their Keycloak profile upon first login via that provider. | **Expected Behaviour/Outcome:** Each configured external IdP in Keycloak has Mappers defined (e.g., mapping email from IdP token to Keycloak email attribute). Verification: Check Mappers tab for each IdP in Keycloak Admin Console. Test login via IdP and verify attributes in Keycloak User profile. |
| FR-IDP-004 | Keycloak login page presents options for configured IdPs and standard Email/Password login. | As a Campaigner, I want to see buttons/options to log in using Facebook, Instagram, or my email/password on the login screen. | **Expected Behaviour/Outcome:** When the frontend redirects to Keycloak's login page, the page displays buttons/links for "Login with Facebook," "Login with Instagram," alongside the standard username/password form (if direct registration is enabled). Verification: View the Keycloak login page presented during the authentication flow. |
| **Campaign Management** | | | |
| FR-CAMP-001 | Allow authenticated Campaigners to initiate campaign creation via a UI form (MUI components). | As a Campaigner, I want a form to enter details (title, description) to start creating a new campaign. | **Expected Behaviour/Outcome:** UI presents a form (using MUI TextField, etc.) accessible only to logged-in Campaigners. Submitting the form initiates the creation process (likely calls a backend API endpoint). Verification: View and interact with the campaign creation form. |
| FR-CAMP-002 | Require successful Stripe payment before finalizing campaign creation. | As the Application Owner, I want Campaigners to pay a fee before their campaign becomes active, ensuring monetization. | **Expected Behaviour/Outcome:** After submitting initial campaign details, the UI initiates the Stripe payment flow (see FR-PAY-001b). The campaign is saved in a 'pending' state in MongoDB. Only after successful payment confirmation (via webhook, see FR-PAY-005b) is the campaign state updated to 'active'. Verification: Attempt creation; observe payment requirement; check campaign state in DB before/after payment; check Stripe logs. |
| FR-CAMP-003 | Mark campaign as active/created in MongoDB upon successful payment confirmation. | As a Backend Developer, I want to update the campaign status reliably after payment succeeds so that it becomes visible and usable. | **Expected Behaviour/Outcome:** The Stripe webhook handler (FR-PAY-005b), upon receiving and verifying a successful payment_intent.succeeded event related to campaign creation, updates the corresponding campaign document in MongoDB (e.g., status: 'active'). Verification: Check MongoDB campaign record status after successful payment. |
| FR-CAMP-004 | Allow Campaigners to view, edit, and potentially deactivate their own campaigns via the UI. | As a Campaigner, I want to manage my existing campaigns by viewing their details, making changes, or pausing them. | **Expected Behaviour/Outcome:** UI displays a list of campaigns belonging to the logged-in Campaigner. Provides options/forms (using MUI components) to view details, edit fields (title, description), or change status (if applicable). Backend API endpoints for fetching/updating campaigns enforce ownership (user ID from JWT must match campaign owner). Verification: Interact with campaign list/edit features; verify backend authorization. |
| **Letter Template Management** | | | |
| FR-LTR-TMPL-001 | Allow Campaigners to create/view/edit/delete letter templates associated with their campaigns via UI forms. | As a Campaigner, I want tools to write and manage different letter templates for each of my campaigns. | **Expected Behaviour/Outcome:** UI provides forms/views (MUI components) within a campaign's management area for CRUD operations on letter templates. Backend API endpoints handle template CRUD operations, ensuring the requesting Campaigner owns the associated campaign. Templates stored in MongoDB. Verification: Interact with template management UI; verify backend API authorization and data persistence. |
| **Browsing & Letter Selection** | | | |
| FR-SEND-001 | Allow all users (anonymous included) to browse/search active campaigns via the UI. | As a General User, I want to easily find campaigns I might want to support. | **Expected Behaviour/Outcome:** UI displays a list/grid of active campaigns fetched from a public backend API endpoint. Search/filter functionality may be present. Uses responsive MUI layout components. Verification: Access campaign list without logging in. |
| FR-SEND-002 | Allow users to select a campaign and view its details and associated letter templates. | As a General User, I want to learn more about a specific campaign and see the letters I can send. | **Expected Behaviour/Outcome:** Clicking a campaign navigates to a detail view showing campaign description and a list of its associated letter templates (fetched from backend). Verification: View campaign detail page and associated templates. |
| FR-SEND-003 | Allow users to select one or more letter templates for sending. | As a General User, I want to choose which letter(s) best express my support for the campaign. | **Expected Behaviour/Outcome:** UI allows selection (e.g., checkboxes using MUI Checkbox) of desired templates from the campaign detail view. Selection state is managed by the frontend. Verification: Select/deselect templates. |
| FR-SEND-004 | Allow users to provide recipient(s) and sender address details via a UI form (MUI components). | As a General User, I want to specify who the letters should be sent to and provide my return address. | **Expected Behaviour/Outcome:** UI presents a form (MUI TextField etc.) to input recipient name/address fields (potentially multiple recipients) and sender name/address fields. Input validation (basic format checks) may occur client-side. Verification: Fill and submit the address form. |
| FR-SEND-005 | System calculates letter sending cost based on the number of selected letters (template * recipient combinations). | As a General User, I want to see the total cost before I pay. As the Application Owner, I want costs calculated accurately for billing. | **Expected Behaviour/Outcome:** Frontend or Backend logic calculates totalCost = numberOfSelectedTemplates * numberOfRecipients * costPerLetter. The calculated cost is displayed to the user before initiating payment. Verification: Select different numbers of templates/recipients and verify displayed cost calculation. |
| FR-SEND-006 | Direct users to Stripe payment flow after address input and cost confirmation. | As a General User, I want a clear transition to the payment step after providing all necessary information. | **Expected Behaviour/Outcome:** After confirming selections and viewing the cost, the UI initiates the Stripe payment flow (see FR-PAY-001a) for the calculated amount. Verification: Observe transition to Stripe payment elements/form. |
| **PDF Generation** | | | |
| FR-PDF-001 | PDF Creator service exposes HTTP POST endpoint accepting JSON (template content, recipient/sender details, date). | As a Backend Developer, I need a service endpoint to request PDF generation based on provided data. | **Expected Behaviour/Outcome:** The PDF Creator service (Node.js/Express) listens on a specific port/path (e.g., /generate) for POST requests with a JSON body containing required data fields. Verification: Send test POST request using curl or HTTP client; verify service receives request. |
| FR-PDF-002 | PDF Creator service uses PDFKit to generate distinct PDF documents merging dynamic data (addresses, date) into template content. | As a Backend Developer, I want the PDF service to reliably create properly formatted PDF documents using the PDFKit library based on the input JSON. | **Expected Behaviour/Outcome:** Upon receiving a valid request, the service uses PDFKit API calls to create a new PDF document. It programmatically writes the template content and inserts the dynamic recipient address block, sender address block, and date into designated positions. A separate PDF is generated for each recipient provided in the request. Verification: Call endpoint with sample data; inspect generated PDF file(s) for correct content and formatting. |
| FR-PDF-003 | PDF Creator service returns generated PDF(s) (e.g., base64 encoded or binary) in the HTTP response. | As a Backend Developer, I need the PDF service to return the generated documents so they can be forwarded to ClickSend. | **Expected Behaviour/Outcome:** The service responds to the POST request with a success status (e.g., 200 OK) and a response body containing the generated PDF(s), potentially as an array of base64 strings or as a single PDF if only one requested, with appropriate Content-Type header (e.g., application/pdf or application/json). Verification: Check HTTP response body and headers from the service. Decode base64 if necessary and validate PDF. |
| **Payment Processing (Stripe)** | | | |
| FR-PAY-001 | Stripe Proxy service exposes endpoints to create Stripe Payment Intents for a) letter sending and b) campaign creation fees. | As a Backend Developer, I need endpoints to initiate Stripe payments for both main transaction types, providing the correct amount and currency. | **Expected Behaviour/Outcome:** Stripe Proxy service (Node.js/Express) has endpoints (e.g., /create-payment-intent/letter, /create-payment-intent/campaign). These endpoints receive the calculated amount, use the stripe-node SDK (stripe.paymentIntents.create) with the Stripe Secret Key to create an intent, and return the client_secret of the intent to the caller (main backend API). Verification: Call endpoints; verify Payment Intent creation in Stripe Dashboard; check returned client_secret. |
| FR-PAY-002 | React Frontend uses Stripe.js and MUI components to securely collect payment details and confirm Payment Intent using client secret. | As a Frontend Developer, I want to use Stripe's secure elements integrated with MUI to collect card details and handle payment confirmation client-side. | **Expected Behaviour/Outcome:** Frontend uses @stripe/react-stripe-js and @stripe/stripe-js. It fetches the client_secret from the backend (via Stripe Proxy). Renders Stripe Elements (Card element) styled to match MUI theme. Uses stripe.confirmCardPayment(client_secret, {payment_method: {card: elements.getElement(CardElement)}}) to confirm payment directly with Stripe. Verification: Interact with payment form; observe network requests to Stripe API; check payment status updates. |
| FR-PAY-003 | Stripe Proxy service handles Stripe webhooks (e.g., payment_intent.succeeded) reliably and securely (verifying signature). | As a Backend Developer, I need a reliable way to receive payment status updates from Stripe and ensure they are authentic before acting upon them (e.g., activating campaign). | **Expected Behaviour/Outcome:** Stripe Proxy exposes a webhook endpoint (e.g., /stripe-webhooks). It uses the stripe-node SDK (stripe.webhooks.constructEvent) with the Stripe Webhook Secret (whsec_...) to verify the signature of incoming events. Valid events are processed (e.g., updating DB, triggering downstream actions); invalid signatures result in 400 Bad Request. Verification: Send test webhooks from Stripe dashboard; check service logs for signature verification success/failure; check processing logic execution. |
| FR-PAY-005 | Upon successful payment confirmation (via webhook): a) Trigger letter sending via ClickSend, b) Mark campaign as active. | As a Backend Developer, I want specific actions to occur automatically after a payment for a specific purpose succeeds. | **Expected Behaviour/Outcome:** Inside the verified webhook handler: a) If event relates to letter sending payment, backend logic calls PDF service, then ClickSend Proxy service. b) If event relates to campaign creation payment, backend logic updates the campaign status in MongoDB to 'active'. Verification: Monitor system behaviour after sending successful test webhooks for both scenarios; check DB status; check logs for downstream calls. |
| FR-PAY-006 | Provide clear UI feedback for payment status (success, failure, processing). | As a User (Campaigner or General), I want to know immediately if my payment was successful or if there was an error. | **Expected Behaviour/Outcome:** Frontend UI listens for the outcome of stripe.confirmCardPayment. Displays appropriate messages (using MUI Alert or Snackbar components) indicating success, failure (with Stripe error message if available), or processing state. Verification: Test payment flows with valid and invalid card details; observe UI feedback messages. |
| **ClickSend Integration** | | | |
| FR-CS-001 | ClickSend Proxy service exposes internal HTTP POST endpoint accepting recipient address(es) and generated PDF letter(s). | As a Backend Developer, I need an internal endpoint to trigger the physical mailing process via ClickSend. | **Expected Behaviour/Outcome:** ClickSend Proxy service listens on a specific port/path for internal POST requests containing validated recipient address data and PDF content (likely base64 encoded). Verification: Send test POST request from main backend service (or test client); verify service receives request. |
| FR-CS-002 | Endpoint callable only internally after successful letter sending payment confirmation. | As a Backend Developer, I want to ensure letters are only sent after payment is confirmed. | **Expected Behaviour/Outcome:** The main backend API logic only calls the ClickSend Proxy endpoint (FR-CS-001) after receiving and verifying the successful payment webhook (FR-PAY-005a). Kubernetes Network Policies should restrict access to the ClickSend Proxy service, ideally only allowing calls from the main backend API service. Verification: Verify call sequence in logs; test Network Policy rules. |
| FR-CS-003 | ClickSend Proxy service uses axios and API credentials to call the ClickSend Post Letter API, submitting address(es) and PDF(s). | As a Backend Developer, I want the ClickSend proxy to correctly format the request and use the API key to interact with the ClickSend Post Letter endpoint. | **Expected Behaviour/Outcome:** The service constructs the request payload required by the ClickSend Post Letter API (including recipient/sender address fields, letter content likely as base64 PDF). It makes an authenticated POST request using axios to the ClickSend API endpoint (https://rest.clicksend.com/v3/post/letters/send), including the API username/key in appropriate headers/auth format. Verification: Check service logs for outgoing request details; check ClickSend dashboard/API logs for received requests; physically verify letter receipt (if feasible in testing). |
| FR-CS-004 | ClickSend Proxy service handles responses/errors from the ClickSend API. | As a Backend Developer, I want the proxy to log success or failure information from ClickSend for troubleshooting. | **Expected Behaviour/Outcome:** The service logs the response status and body received from ClickSend. Handles potential errors (e.g., invalid address, API key error, insufficient funds) by logging detailed error information. May implement retry logic for transient errors if necessary. Verification: Check service logs after making calls; trigger error conditions (e.g., invalid API key) and check error logging. |
| **Email Functionality** | | | |
| FR-EMAIL-001 | Email Proxy service (or main backend) handles sending transactional emails (registration, receipts, password reset) via SMTP/API. | As a Backend Developer, I need a mechanism to send operational emails to users triggered by specific system events. | **Expected Behaviour/Outcome:** A dedicated service or logic within the main backend uses an email library (e.g., nodemailer for SMTP, or official SDK for SendGrid/Mailgun API) configured with credentials (from env vars/secrets) to send emails. Specific functions exist like sendRegistrationEmail(to), sendPaymentReceipt(to, details), etc. Verification: Trigger events (register user, make payment); check email inbox; check email service logs (e.g., SendGrid activity feed). |
| FR-EMAIL-003 | Email sending is triggered by relevant backend logic (e.g., post-registration, webhook processing). | As a User, I expect to receive confirmation emails promptly after performing key actions like registering or paying. | **Expected Behaviour/Outcome:** Backend code explicitly calls the email sending functions (FR-EMAIL-001) at the appropriate points in the application flow (e.g., after user creation in DB, after processing successful payment webhook). Verification: Verify email sending function calls in backend logs during relevant workflows. |

### 15.3 Glossary

(Includes previous terms plus new ones)

- **API:** Application Programming Interface

- **Axios:** Promise-based HTTP client for Node.js.

- **CCPA:** California Consumer Privacy Act

- **CDN:** Content Delivery Network

- **CI/CD:** Continuous Integration / Continuous Delivery

- **Conventional Commits:** Specification for adding human and machine readable meaning to commit messages.

- **CSP:** Content Security Policy

- **DSAR:** Data Subject Access Request

- **DX:** Developer Experience

- **E2E:** End-to-End (Testing)

- **Fetch API:** Browser built-in interface for fetching resources.

- **GCP:** Google Cloud Platform

- **GDPR:** General Data Protection Regulation

- **GKE:** Google Kubernetes Engine

- **HMR:** Hot Module Replacement

- **HPA:** Horizontal Pod Autoscaler

- **HSTS:** HTTP Strict Transport Security

- **Husky:** Tool for managing Git hooks.

- **IdP:** Identity Provider

- **IAM:** Identity and Access Management

- **IDOR:** Insecure Direct Object Reference

- **JWT:** JSON Web Token

- **JWKS:** JSON Web Key Set

- **K8s:** Kubernetes

- **Kustomize:** Tool for customizing Kubernetes object configuration.

- **Lint-Staged:** Tool to run linters on staged Git files.

- **LTS:** Long-Term Support (Node.js version)

- **mkcert:** Tool for making locally-trusted development certificates.

- **Monorepo:** Single repository containing multiple distinct projects/packages.

- **mTLS:** Mutual Transport Layer Security

- **MUI:** Material UI (React component library).

- **NGINX:** High-performance web server and reverse proxy.

- **OIDC:** OpenID Connect

- **OWASP:** Open Web Application Security Project

- **PCI DSS:** Payment Card Industry Data Security Standard

- **PDFKit:** PDF generation library for Node.js.

- **PKCE:** Proof Key for Code Exchange (OIDC security extension).

- **PNPM:** Performant npm client, good for monorepos.

- **PRD:** Project Requirements Document

- **RBAC:** Role-Based Access Control

- **RTL:** React Testing Library

- **SDK:** Software Development Kit

- **SPA:** Single-Page Application

- **SSO:** Single Sign-On

- **SSRF:** Server-Side Request Forgery

- **Supertest:** Library for testing Node.js HTTP servers.

- **TLS:** Transport Layer Security

- **Vite:** Frontend build tool and development server.

- **WCAG:** Web Content Accessibility Guidelines
