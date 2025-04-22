Project Requirements Document (PRD) - v3.0
==========================================

1\. Introduction
----------------

### 1.1 Purpose

This document outlines the functional, non-functional, technical, and operational requirements for a new web application. The application will provide a platform enabling registered "Campaign Users" to create advocacy campaigns (requiring payment) and associated letter templates. Other "General Users" (anonymous or registered) can browse campaigns, select letters, provide recipient details, and pay via Stripe to have these letters physically mailed via ClickSend. The application prioritizes security, maintainability, user experience across devices, GDPR/CCPA compliance, and an efficient developer workflow, managed within a monorepo structure.

### 1.2 Scope

The scope includes the design, development, testing, and deployment of:

-   A **responsive** React frontend UI (Vite, TypeScript, **Material UI**) handling **direct OIDC interactions with Keycloak**.

-   A Node.js backend API (JavaScript, Express) handling business logic and **validating OIDC tokens received from the frontend**.

-   **NGINX** as a secure reverse proxy.

-   Identity and Access Management via **Keycloak**, configured for **user roles** and **brokering external Identity Providers (Facebook, Instagram, Email)**.

-   Data persistence using MongoDB and PostgreSQL (for Keycloak).

-   Microservices for PDF generation (Node.js/PDFKit), Stripe payments (Node.js), ClickSend integration (Node.js), and Email dispatch (Node.js/SMTP).

-   Containerization (Docker, **Alpine Linux focus**) for all components.

-   Deployment via **Kubernetes (GKE)** with detailed manifest requirements.

-   A **monorepo** structure with defined tooling.

-   Comprehensive testing strategy (Unit, Component, Integration, E2E).

-   CI/CD pipelines using **GitHub Actions** with dependency scanning.

-   Detailed development environment setup and **Developer Experience (DX)** enhancements.

### 1.3 Goals and Objectives

-   **Security:** Implement OWASP Top 10 mitigations, secure OIDC flow, PCI DSS compliance, robust NGINX configuration.

-   **Privacy:** Comply with GDPR and CCPA (consent, DSAR, data minimization, retention).

-   **Usability:** Deliver an intuitive, **responsive** UI optimized for **desktop and mobile browsers**, leveraging **Material UI** for a consistent look and feel.

-   **Maintainability:** Build modular, well-documented code within a **monorepo**, using **conventional commits** and automated changelogs.

-   **Scalability:** Design for future horizontal scaling, starting with single replicas.

-   **Reliability:** Ensure high availability via GKE deployment and backups.

-   **Performance:** Deliver fast load times and responsive API interactions.

-   **Developer Experience:** Provide a smooth, efficient local development setup, clear processes, and helpful tooling (single-command startup, debugging, testing, CI/CD).

### 1.4 Stakeholders

-   Development Team

-   Product Owner / Project Manager

-   End Users:

    -   **Campaign Users (Campaigners):** Registered users (via Keycloak, potentially brokered) who create campaigns and letter templates.

    -   **General Users:** Users (anonymous or registered) who browse campaigns and send letters.

-   Operations / DevOps Team

-   Security Team

### 1.5 Assumptions

-   Fee structures for campaign creation and letter sending are defined.

-   Necessary third-party accounts/API keys (Stripe, ClickSend, Email Relay, GCP, Facebook Developer, Instagram Developer) are available.

-   The team has expertise in the specified technologies.

-   Initial user load is low, allowing for starting with single replicas.

2\. Functional Requirements
---------------------------

### 2.1 User Roles and Management

-   **FR-ROLE-001:** The system must support two primary user roles: Campaigner and General User.

-   **FR-ROLE-002:** User roles **MUST** be managed within Keycloak using its role management features. The backend API **MUST** authorize access based on roles extracted from validated JWTs.

-   **FR-ROLE-003:** The Campaigner role is required to access campaign creation, campaign editing, and letter template management functionalities.

-   **FR-ROLE-004:** General User functionality (browsing, selecting letters, initiating send process) **MUST** be accessible to anonymous users. Optional registration might grant additional features later.

### 2.2 User Authentication and Authorization (OIDC Flow)

-   **FR-AUTH-001:** Authentication **MUST** be handled using the OpenID Connect (OIDC) Authorization Code Flow.

-   **FR-AUTH-002:** The **React Frontend MUST** initiate the OIDC login flow by redirecting the user to the Keycloak authorization endpoint when a Campaigner login is required.

-   **FR-AUTH-003:** The Frontend **MUST** handle the redirect back from Keycloak, exchanging the authorization code for tokens (ID Token, Access Token, Refresh Token) at the Keycloak token endpoint. This exchange **MUST** happen securely (details TBD - typically backend handles code exchange, or frontend uses PKCE). **Decision: Use PKCE flow handled entirely by the frontend **

-   **FR-AUTH-004:** The Frontend **MUST** securely manage the received tokens (e.g., store in memory, potentially use Refresh Token for silent renewal). ID/Access tokens **MUST NOT** be stored in localStorage or sessionStorage.

-   **FR-AUTH-005:** For requests to protected backend API endpoints, the Frontend **MUST** include the Access Token in the Authorization: Bearer <token> header using fetch.

-   **FR-AUTH-006:** The **Node.js Backend API MUST** implement middleware to protect specific routes. This middleware **MUST:**

    -   Extract the Bearer token from the Authorization header.

    -   Verify the token's signature against Keycloak's public keys (fetched from the JWKS URI).

    -   Validate the token's issuer (iss), audience (aud), and expiry (exp).

    -   Extract user information and roles from the validated token for use in authorization logic.

-   **FR-AUTH-007:** Campaign Users **MUST** be able to log out. Logout **MUST** invalidate the session in the Frontend and redirect the user to Keycloak's end session endpoint to terminate the Keycloak session.

-   **FR-AUTH-008:** Keycloak **MUST** provide password recovery/reset functionality for users registered directly via email.

### 2.3 Identity Brokering (Keycloak Configuration)

-   **FR-IDP-001:** Keycloak **MUST** be configured as an identity broker.

-   **FR-IDP-002:** Keycloak **MUST** be configured to allow users to authenticate via the following external Identity Providers (IdPs):

    -   Facebook

    -   Instagram

    -   Email/Password (managed directly by Keycloak)

-   **FR-IDP-003:** Appropriate Keycloak Identity Provider mappers **MUST** be configured to map attributes (like email, name) from external IdPs to Keycloak user profiles.

-   **FR-IDP-004:** The Keycloak login screen **MUST** present options for users to choose their preferred authentication method (Facebook, Instagram, or Email/Password).

### 2.4 Campaign Management (for Campaign Users)

-   **FR-CAMP-001:** Logged-in Campaign Users **MUST** be able to initiate the creation of a new campaign (providing details via a form: title, description, target goal [optional], etc.).

-   **FR-CAMP-002:** Before final campaign creation, the Campaign User **MUST** complete a Stripe payment process.

-   **FR-CAMP-003:** Upon successful payment, the campaign **MUST** be marked as active/created.

-   **FR-CAMP-004:** Campaign Users **MUST** be able to view, edit, and potentially deactivate their own campaigns via the UI.

### 2.5 Letter Template Management (for Campaign Users)

-   **FR-LTR-TMPL-001:** Campaign Users **MUST** be able to create, view, edit, and delete letter templates associated with their active campaigns. Templates include a name, subject, and body content.

### 2.6 Browsing and Letter Selection (for General Users)

-   **FR-SEND-001:** All users **MUST** be able to browse/search active campaigns.

-   **FR-SEND-002:** Users **MUST** be able to select a campaign and view its associated letter templates.

-   **FR-SEND-003:** Users **MUST** be able to select one or more templates to send.

-   **FR-SEND-004:** Users **MUST** provide recipient details (Name, Address fields) and sender address details via a form.

-   **FR-SEND-005:** The system **MUST** calculate the cost based on the number of letters selected (template * recipient combinations).

-   **FR-SEND-006:** Users **MUST** be directed to the Stripe payment flow to pay the calculated amount.

### 2.7 PDF Generation

-   **FR-PDF-001:** The PDF Creator service **MUST** expose an HTTP POST endpoint accepting JSON data (template content, recipient details, sender details, date).

-   **FR-PDF-002:** The service **MUST** use **PDFKit** to generate a distinct PDF for each recipient, merging dynamic data into a base template.

-   **FR-PDF-003:** The service **MUST** return the generated PDF(s) (e.g., as base64 encoded strings or binary data) to the calling service.

### 2.8 Payment Processing (Stripe)

-   **FR-PAY-001:** The Stripe Proxy service **MUST** expose endpoints to create Stripe Payment Intents for:

    -   Campaign creation fees.

    -   Letter sending costs.

-   **FR-PAY-002:** The React Frontend **MUST** use Stripe.js and Material UI input components (styled appropriately) to securely collect payment details and confirm the Payment Intent using the client secret obtained from the Stripe Proxy.

-   **FR-PAY-003:** The Stripe Proxy service **MUST** handle Stripe webhooks (e.g., payment_intent.succeeded, payment_intent.payment_failed) to reliably update application state (activate campaign, trigger letter sending). Webhook handling **MUST** be idempotent and secure (verify webhook signature).

-   **FR-PAY-004:** Payment flows **MUST** provide clear user feedback (success, failure, processing).

### 2.9 ClickSend Integration

-   **FR-CS-001:** The ClickSend Proxy service **MUST** expose an HTTP POST endpoint accepting recipient address details and the corresponding generated PDF letter(s).

-   **FR-CS-002:** This endpoint **MUST** only be callable internally after successful payment confirmation for letter sending.

-   **FR-CS-003:** The service **MUST** use the **ClickSend Post Letter API** (authenticating via API key) to submit the mailing request.

-   **FR-CS-004:** The service **MUST** handle responses and potential errors from the ClickSend API.

### 2.10 Email Functionality

-   **FR-EMAIL-001:** The Email Proxy service (or main backend) **MUST** handle sending transactional emails via a configured SMTP relay/API (e.g., SendGrid).

-   **FR-EMAIL-002:** Emails include: Campaigner registration confirmation, password resets, payment receipts (campaign creation & letter sending).

-   **FR-EMAIL-003:** Email sending **MUST** be triggered by backend logic (e.g., after successful registration, payment webhook processing).

3\. Non-Functional Requirements
-------------------------------

### 3.1 Security

-   **NFR-SEC-001:** Mitigate OWASP Top 10 vulnerabilities through secure coding practices, input validation, output encoding, dependency scanning, and proper configuration.

-   **NFR-SEC-002:** Enforce HTTPS for all external traffic via NGINX configuration (TLS 1.2+).

-   **NFR-SEC-003:** Secure OIDC flow: Use PKCE, secure token handling in frontend (in-memory), robust backend token validation (signature, claims), secure Keycloak configuration (realm settings, client secrets).

-   **NFR-SEC-004:** Secure NGINX Configuration:

-   Implement SSL termination with strong ciphers and protocols.

    -   Configure secure headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

    -   Disable unnecessary modules and server information disclosure (server_tokens off).

    -   Implement request limiting (rate limiting, connection limiting) to mitigate DoS/brute-force.

    -   Configure proxy settings securely (proxy_set_header, etc.).

-   **NFR-SEC-005:** Achieve and maintain PCI DSS v4.0 compliance for the payment flow components (Frontend payment elements, Stripe Proxy, Stripe interaction).

-   **NFR-SEC-006:** Implement GDPR/CCPA requirements (Consent mechanisms, DSAR handling for Campaigners, data minimization, clear retention policies, privacy policy).

-   **NFR-SEC-007:** Secure microservice communication (within Kubernetes cluster) using Network Policies. Consider mTLS via a service mesh if complexity increases significantly later.

-   **NFR-SEC-008:** Store all secrets (API keys, passwords, client secrets) securely using Kubernetes Secrets integrated with GCP Secret Manager (or equivalent). **NEVER** commit secrets to version control.

-   **NFR-SEC-009:** Regularly scan dependencies (npm audit, Snyk/Dependabot) and Docker images (GCR scanning, Trivy/Snyk) for vulnerabilities.

### 3.2 Performance

-   **NFR-PERF-001:** Target API response times < 500ms (p95) under typical load.

-   **NFR-PERF-002:** Target frontend Largest Contentful Paint (LCP) < 2.5s.

-   **NFR-PERF-003:** Optimize frontend bundle size using Vite build optimizations, code splitting, and tree shaking.

-   **NFR-PERF-004:** Implement appropriate database indexing (MongoDB, PostgreSQL) based on query patterns.

-   **NFR-PERF-005:** Utilize NGINX caching for static assets and potentially Gzip compression.

### 3.3 Scalability

-   **NFR-SCAL-001:** Initial deployment: Single replicas for stateless services. Design Kubernetes Deployments for easy scaling (replicas adjustment, HPA).

-   **NFR-SCAL-002:** Databases: Use appropriately sized managed instances (Cloud SQL, MongoDB Atlas) or configure K8s StatefulSets allowing future scaling/replication.

### 3.4 Reliability

-   **NFR-REL-001:** Target 99.9% uptime (excluding planned maintenance).

-   **NFR-REL-002:** Deploy across multiple availability zones in GKE.

-   **NFR-REL-003:** Implement automated daily backups for MongoDB and PostgreSQL with defined retention.

-   **NFR-REL-004:** Implement readiness and liveness probes for all backend services in Kubernetes.

-   **NFR-REL-005:** Implement graceful shutdown handling in Node.js services.

### 3.5 Maintainability

-   **NFR-MAIN-001:** Adhere strictly to the **monorepo** structure defined in Section 4.4.

-   **NFR-MAIN-002:** Enforce consistent code style (ESLint, Prettier) via pre-commit hooks (husky).

-   **NFR-MAIN-003:** Follow **Conventional Commits specification** for all git commits (commitlint).

-   **NFR-MAIN-004:** Automatically generate CHANGELOG.md using conventional-changelog-cli.

-   **NFR-MAIN-005:** Write clear, concise code with comments for complex logic. Use TypeScript effectively in the frontend.

-   **NFR-MAIN-006:** Structure backend code logically (e.g., routes, controllers, services, models).

-   **NFR-MAIN-007:** Structure frontend code logically (e.g., features, components, hooks, services, layouts). Use absolute import aliases (@/components).

-   **NFR-MAIN-008:** Maintain comprehensive documentation (READMEs per package, architecture decisions).

### 3.6 Usability & Accessibility

-   **NFR-USE-001:** Implement a **responsive UI** using **Material UI** components and theming, adapting fluidly to desktop, tablet, and mobile viewports.

-   **NFR-USE-002:** Ensure cross-browser compatibility (latest Chrome, Firefox, Safari, Edge) on desktop and mobile.

-   **NFR-USE-003:** Follow WCAG 2.1 AA accessibility guidelines where feasible, leveraging Material UI's accessibility features. Provide ARIA attributes and keyboard navigation support.

-   **NFR-USE-004:** Ensure intuitive navigation and clear user flows.

### 3.7 Testability

-   **NFR-TEST-001:** Implement comprehensive automated testing strategy covering:

-   **Unit Tests:** Jest (Backend logic, Frontend utils/hooks).

    -   **Component Tests:** React Testing Library + Jest (Frontend components in isolation).

    -   **Integration Tests:** Jest/Supertest (Backend API endpoints), potentially RTL/Jest for frontend service integrations.

    -   **End-to-End (E2E) Tests:** Playwright (Key user flows simulating real browser interaction across different viewports).

-   **NFR-TEST-002:** Aim for high test coverage targets (specific % TBD, e.g., >80% for critical logic).

-   **NFR-TEST-003:** Integrate tests into the CI/CD pipeline; failures **MUST** block deployment.

### 3.8 Developer Experience (DX)

-   **NFR-DX-001:** Provide a single command (scripts/dev.sh) to spin up the complete local development stack (all containers via Docker Compose) with hot-reloading and local TLS.

-   **NFR-DX-002:** Configure VS Code debugging (launch.json) for easy step-through debugging of Frontend (browser), Backend API, and potentially other Node.js microservices.

-   **NFR-DX-003:** Provide example HTTP request files (*.http or *.rest) for interacting with backend APIs using VS Code REST Client extension (or similar).

-   **NFR-DX-004:** Implement pre-commit hooks (husky) for linting, formatting, and commit message validation (commitlint).

-   **NFR-DX-005:** Ensure fast feedback loops (quick builds, fast tests, hot-reloading).

-   **NFR-DX-006:** Maintain clear setup instructions and documentation within the monorepo.

4\. System Architecture
-----------------------

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

-   **Client:** User's web browser on desktop or mobile. Interacts with the React frontend.

-   **Load Balancer / CDN:** (GCP LB / Cloudflare) Edge termination, DDoS protection, CDN.

-   **Kubernetes Ingress:** Routes external traffic to the NGINX service within the cluster. Handles SSL termination using cluster-managed certificates.

-   **NGINX Reverse Proxy:**

-   Based on nginx:alpine image.

    -   **Responsibilities:** SSL termination (if not done at Ingress), routing requests to frontend static files or backend API (/api prefix), serving frontend static files efficiently, applying security headers, Gzip compression, rate limiting. **Does NOT handle OIDC logic.**

-   **React UI (FrontendApp):**

-   Built with Vite, TypeScript, **Material UI**.

    -   **Handles OIDC Authorization Code Flow with PKCE** using keycloak-js adapter. Manages tokens securely (in memory).

    -   Includes bearer tokens in API requests to the backend using fetch.

    -   Implements responsive layouts using MUI components and grid system.

    -   Containerized (multi-stage build node:alpine -> static files served by NGINX).

-   **Node.js Express API (BackendApi):**

-   Built with Node.js (JavaScript), Express.

    -   **Validates JWT Bearer tokens** received from Frontend using libraries like jsonwebtoken, jwks-rsa. Checks signature against Keycloak's JWKS endpoint. Validates claims (iss, aud, exp).

    -   Implements business logic, interacts with MongoDB, orchestrates calls to other microservices using axios.

    -   Containerized (node:alpine).

-   **Keycloak IAM:**

    -   Official quay.io/keycloak/keycloak image.

        -   Manages users, roles (Campaigner), clients (frontend, backend). **Configured for IdP Brokering** (Facebook, Instagram, Email).

        -   Provides OIDC endpoints (authorization_endpoint, token_endpoint, jwks_uri, end_session_endpoint). Uses PostgreSQL.

-   **PostgreSQL (PostgresDb):**

    -   postgres:alpine image. Stores Keycloak data.

-   **MongoDB (MongoDb):**

    -   mongo:latest image. Stores application data (Campaigns, Templates, User Profiles [linked via Keycloak ID]). GDPR/CCPA considerations for data storage/retention.

-   **PDF Creator Service:** node:alpine + **PDFKit**. Generates PDFs via HTTP POST.

-   **Stripe Proxy Service:** node:alpine. Creates Payment Intents, handles Stripe webhooks securely. PCI Scope. Uses axios for Stripe API calls.

-   **ClickSend Proxy Service:** node:alpine. Interfaces with ClickSend Post Letter API via axios.

-   **Email Proxy Service:** node:alpine. Sends transactional emails via SMTP/API using axios or nodemailer.

### 4.3 Monorepo Strategy

-   **Requirement:** The entire application (frontend, backend API, microservices, shared libraries, configs) **MUST** be managed within a single Git repository (monorepo).

-   **Tooling:** Utilize npm workspaces or pnpm workspaces for managing dependencies and running scripts across packages. Consider Nx or Turborepo for enhanced caching, build orchestration, and dependency graph visualization if complexity warrants it later. **Initial Recommendation: Use **

-   **Benefits:** Simplified dependency management, easier code sharing, atomic commits across related packages, consistent tooling setup.

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

5\. Technology Stack
--------------------

| Category | Technology/Tool | Version/Spec | Rationale/Notes |
|----------|------------------|---------------|------------------|
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
|  | PostgreSQL | Latest (postgres:alpine image) | Relational DB for Keycloak. |
| **PDF Generation** | Node.js + **PDFKit** | Node LTS, PDFKit latest | Programmatic PDF generation, suitable for templates. |
| **Payment Gateway** | Stripe | API latest | Payment processing. Use stripe-node SDK in proxy. |
| **Communication Service** | ClickSend | Post Letter API latest | Physical letter mailing. Use axios in proxy. |
| **Email Service** | SendGrid / Mailgun / etc. | API/SMTP latest | Transactional email delivery. Use SDK or nodemailer + axios. |
| **Containerisation** | Docker | Latest | Container runtime. |
| **Container Orchestration** | Google Kubernetes Engine (GKE) | Latest stable | Managed K8s on GCP. |
| **Container Registry** | Google Container Registry (GCR) | N/A | Private Docker image storage. |
| **CI/CD** | **GitHub Actions** | N/A | Automation for build, test, scan, deploy integrated with GitHub. |
| **Linting/Formatting** | ESLint, Prettier | Latest | Code quality and


6\. Data Management
-------------------

-   **MongoDB:** Stores Campaigns, Letter Templates, potentially anonymized usage data. Requires Mongoose schemas, appropriate indexing, GDPR/CCPA compliant retention for any PII traces. Consider fields for campaignCreationPaymentStatus.

    -   **PostgreSQL:** Stores Keycloak data (Users [linked to app profiles via ID], Roles, Clients, IdP configs). Managed by Keycloak. Regular backups essential.

    -   **Data Migration:** Use a migration tool/scripts (e.g., migrate-mongo) for managing MongoDB schema changes.

    -   **Backup Strategy:** Automated daily backups for PostgreSQL (Cloud SQL point-in-time recovery or K8s snapshots) and MongoDB (Managed service backups or K8s volume snapshots). Define retention policies (e.g., 7-30 days). Test restore procedures periodically.

    -   **GDPR/CCPA:** Implement consent management (cookie banners, terms acceptance), DSAR process for Campaigners (data access/export/deletion via Keycloak/app), data minimization (collect only needed address fields), strict retention/deletion policies for General User PII (recipient/sender addresses - delete after mail confirmed sent + grace period, e.g., 30 days). Document all PII processing.

7\. Security Requirements (Detailed)
------------------------------------

(Combines previous OWASP section with new specifics)

-   **Authentication/Authorization:**

    -   Strictly follow OIDC Authorization Code Flow with PKCE via keycloak-js.

    -   Backend **MUST** validate JWT signature using Keycloak's JWKS endpoint and validate iss, aud, exp claims on every protected request.

    -   Implement Role-Based Access Control (RBAC) based on Keycloak roles in backend API routes/controllers.

    -   Configure Keycloak securely: Strong password policies, brute force detection, secure realm/client settings, rotate client secrets if used (though backend client likely public with PKCE).

-   **Input Validation:**

    -   Validate all incoming data on the backend API (request bodies, query params, path params) using libraries like express-validator or zod. Reject invalid requests early.

    -   Sanitize data before using it in database queries (Mongoose helps), external API calls, or PDF generation.

-   **Output Encoding:**

    -   Leverage React/MUI's built-in XSS protection. Avoid dangerouslySetInnerHTML.

    -   Encode data appropriately if displayed in non-standard contexts.

-   **NGINX Configuration:** See NFR-SEC-004 for details (TLS, Headers, Rate Limiting, Info Hiding).

-   **Secret Management:** Use K8s Secrets (populated via build pipeline/GCP Secret Manager) mounted as environment variables or files. See Section 11.

-   **PCI DSS:** Isolate Stripe Proxy service network-wise where possible. Ensure secure handling of Payment Intents. Adhere to all relevant PCI DSS v4.0 requirements.

-   **Dependency Management:** Integrate pnpm audit and Snyk/Dependabot scans into CI pipeline. Fail builds on critical vulnerabilities. Maintain an update/patching process.

-   **Container Security:** Use minimal Alpine base images, run containers as non-root users (USER directive in Dockerfile), remove unnecessary packages, scan images. Use K8s securityContext.

-   **Network Security:** Utilize K8s Network Policies to restrict pod-to-pod communication based on least privilege. Control ingress and egress traffic.

-   **Logging & Monitoring:** Log security-relevant events (auth success/failure, access denied, payment processing, admin actions). Monitor for anomalies and alert on suspicious activity.

-   **GDPR/CCPA:** Implement technical measures supporting privacy requirements (see Section 6).

8\. Deployment and Operations
-----------------------------

### 8.1 Containerization Strategy

-   **Requirement:** Each application component (Frontend [served by NGINX], Backend API, Microservices, Keycloak, Databases) **MUST** run in its own Docker container.

-   **Base Images:** Use official **Alpine Linux** variants where available and stable (nginx:alpine, node:alpine, postgres:alpine). Use official non-Alpine if necessary (mongo:latest, quay.io/keycloak/keycloak).

-   **Dockerfiles:**

-   Utilize multi-stage builds to minimize final image size (e.g., build frontend/backend in a Node stage, copy artifacts to final Alpine stage).

    -   Run processes as a non-root user (USER node or similar).

    -   Include health check instructions (HEALTHCHECK).

    -   Minimize layers and clean up build artifacts.

-   **.dockerignore:** Use effectively to exclude unnecessary files (node_modules, .git, *.log, local configs) from the build context.

-   **Registry:** Store images in **GCR**. Tag images appropriately (e.g., git SHA, semantic version).

### 8.2 Kubernetes Manifests Requirements

-   **Location:** Store manifests under infra/k8s/. Use kustomize with base and overlays (development, staging, production) for environment-specific configurations.

-   **Required Objects:**

-   Namespace: Define namespaces for organization (e.g., app-staging, app-production).

    -   Deployment: For stateless services (NGINX, Backend API, Microservices). Include:

    -   replicas (starting at 1, defined per overlay).

        -   selector and template.metadata.labels.

        -   template.spec.containers: Image, ports, env vars (from ConfigMaps/Secrets), volume mounts, resource requests/limits (cpu, memory), readiness/liveness probes (httpGet or tcpSocket), securityContext (runAsNonRoot: true, allowPrivilegeEscalation: false).

    -   StatefulSet: For stateful services deployed in K8s (MongoDB, PostgreSQL - if not using managed GCP services). Includes volumeClaimTemplates.

    -   Service: To expose Deployments/StatefulSets internally (ClusterIP) or externally (LoadBalancer - usually managed by Ingress).

    -   Ingress: To manage external access (e.g., Nginx Ingress Controller). Define rules for routing traffic to the NGINX service, configure TLS using cert-manager or GCP Managed Certificates.

    -   ConfigMap: To store non-sensitive configuration data, mounted as files or env vars. Managed per environment overlay.

    -   Secret: To store sensitive data (API keys, passwords), base64 encoded. Managed per environment overlay, potentially integrated with external secret managers (like GCP Secret Manager via CSI driver).

    -   PersistentVolumeClaim (PVC): For StatefulSets.

    -   NetworkPolicy: To restrict network traffic between pods based on labels.

    -   HorizontalPodAutoscaler (HPA): Define later for auto-scaling based on CPU/memory or custom metrics.

-   **Best Practices:** Use clear labels, annotations, define resource requests/limits, implement probes.

### 8.3 CI/CD Implementation (GitHub Actions)

-   **Location:** .github/workflows/.

-   **Triggers:** On push/merge to main (deploy staging), on tag creation (deploy production), on pull request (build, test, lint, scan).

-   **Workflow (**

-   actions/checkout@v4

    -   Setup PNPM (pnpm/action-setup)

    -   Install dependencies (pnpm install --frozen-lockfile)

    -   Lint checks (pnpm lint)

    -   Unit/Component/Integration Tests (pnpm test)

    -   E2E Tests (pnpm test:e2e - might run conditionally or in separate workflow)

    -   Dependency Vulnerability Scan (pnpm audit, Snyk Action / github/codeql-action/analyze, Dependabot integration). **Fail workflow on critical/high severity vulnerabilities.**

    -   Build applications (pnpm build -r or specific package builds).

-   **Workflow (deploy-staging.yml on merge to main):**

    1.   Checkout code.

    2.   Authenticate to GCP/GCR (google-github-actions/auth).

    3.   Build and push Docker images for each service (docker/build-push-action), tag with Git SHA.

    4.   Authenticate to GKE cluster.

    5.   Deploy/Apply Kubernetes manifests using kustomize build infra/k8s/overlays/staging | kubectl apply -f -.

-   **Workflow (deploy-prod.yml on tag creation):**

    1.  Similar to staging, but:

    2.  Triggered by tag (e.g., v*.*.*).

    3.  Build/push Docker images tagged with the Git tag.

    4.  Uses production overlay: kustomize build infra/k8s/overlays/production | kubectl apply -f -.

-   **Secrets:** Use GitHub Actions encrypted secrets for GCP credentials, API keys needed during build/deploy.

9\. Development Environment Setup (Local)
-----------------------------------------

### 9.1 Docker Compose Configuration (docker-compose.yml)

-   **Requirement:** Define all services (frontend dev server, nginx, backend api, microservices, keycloak, postgres, mongo) in docker-compose.yml.

-   **Services:**

    -   frontend: Runs Vite dev server (pnpm dev), mounts packages/frontend/src for hot-reloading. Exposes Vite port (e.g., 5173). Depends on backend-api.

    -   backend-api: Runs Node.js API (pnpm dev), mounts packages/backend-api/src for hot-reloading (using nodemon). Exposes API port. Depends on mongo, postgres, other proxies.

    -   Microservices (pdf, stripe, clicksend, email): Similar setup to backend-api with source code mounts and dev scripts.

    -   nginx: Uses official nginx:alpine image. Mounts local NGINX config file (nginx.conf), local frontend build (for testing prod-like serving if needed, though dev usually hits Vite server directly), and local TLS certs. Proxies requests to frontend:5173 or backend-api:PORT. Exposes port 80/443.

    -   keycloak: Uses quay.io/keycloak/keycloak. Configured with start-dev or start command. Environment variables for admin user, DB connection (pointing to postgres service), hostname. Mount volume for realm imports (/opt/keycloak/data/import). Exposes port 8080. Depends on postgres.

    -   postgres: Uses postgres:alpine. Environment variables for Keycloak DB user/pass/db name. Mount named volume for data persistence.

    -   mongo: Uses mongo:latest. Mount named volume for data persistence.

-   **Networking:** Services communicate using service names as hostnames on the default Docker bridge network.

-   **Environment Variables:** Load variables from .env file using env_file property or directly in compose file for non-sensitive defaults.

### 9.2 Local TLS Setup

-   **Requirement:** Local development **MUST** run over HTTPS to mirror production and support secure cookies/features.

-   **Tooling:** Use mkcert to generate locally trusted certificates.

-   Run mkcert -install (once per machine).

    -   Generate certs for localhost (and potentially custom dev domains): mkcert localhost 127.0.0.1 ::1 -> creates localhost*.pem files.

-   **Integration:**

-   Store generated .pem files in certs/ (gitignore this directory).

    -   Mount certs/ volume into the NGINX container.

    -   Configure NGINX server block to listen on 443 SSL and use the mounted certificate/key files (ssl_certificate, ssl_certificate_key).

    -   Configure Vite dev server (vite.config.ts) to use the same certificates for its HTTPS server (if accessing Vite directly).

-   **Script:** Provide scripts/setup-certs.sh to automate mkcert generation.

### 9.3 Single Command Startup (scripts/dev.sh)

-   **Requirement:** A single script to launch the entire local development environment.

-   **Implementation (dev.sh):**

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

-   **EditorConfig (** Define basic coding style rules (indentation, line endings).

-   **Prettier (** Configure code formatting rules. Integrate with ESLint (eslint-config-prettier).

-   **ESLint (** Configure linting rules for TypeScript (frontend) and JavaScript (backend). Use relevant plugins (React, TypeScript, Node).

-   **Husky + lint-staged (** Configure pre-commit hooks to run linters, formatters, and potentially tests on staged files.

-   **Commitlint (** Configure rules to enforce Conventional Commits format using Husky commit-msg hook.

-   **VS Code (** Recommend extensions (ESLint, Prettier, Docker, Remote-Containers, Playwright, REST Client), configure format-on-save.

-   **PNPM:** Use pnpm for all package management commands within the monorepo.

### 9.5 VS Code Debugging (.vscode/launch.json)

-   **Requirement:** Provide configurations for debugging key services.

-   **Configurations:**

    -   **Frontend (Chrome/Edge):** Launch browser against https://localhost (or Vite port) with source maps enabled.

    -   **Backend API (Node.js Attach):** Attach debugger to the Node.js process running inside the backend-api Docker container (requires exposing debug port, e.g., 9229, from container and using nodemon --inspect=0.0.0.0:9229). Use restart: true for auto-reconnecting with nodemon.

    -   **Microservices (Node.js Attach):** Similar attach configurations for other Node.js services if needed.

    -   **E2E Tests (Playwright):** Configuration to run Playwright tests with debugging enabled.

### 9.6 REST Client Examples (*.http / *.rest)

-   **Requirement:** Provide example requests for common backend API endpoints.

-   **Location:** Place files like requests/campaigns.http or similar.

-   **Content:** Include requests for GET, POST, PUT, DELETE operations, showing required headers (e.g., Content-Type, placeholder for Authorization: Bearer {{token}}) and example request bodies. Use variables for hostname, tokens.

10\. Testing Strategy (Detailed)
--------------------------------

### 10.1 Unit Testing

-   **Frontend:** Use **Jest** and **React Testing Library (RTL)**. Focus on testing individual utility functions, custom hooks, and simple components in isolation. Mock external dependencies (API calls, libraries).

-   **Backend:** Use **Jest**. Focus on testing individual functions/modules (services, utils) in isolation. Mock database interactions and external API calls (axios).

-   **Location:** tests directory within each package (frontend/tests, backend-api/tests, etc.). Files typically named *.test.ts or *.test.js.

-   **Execution:** Run via pnpm test command, configured in root and package package.json.

### 10.2 Component Testing (Frontend)

-   **Framework:** Use **Jest** and **React Testing Library (RTL)**.

-   **Focus:** Test individual React components or small groups of components, verifying rendering, user interactions (clicks, form input), and state changes based on props. Mock necessary context providers or service calls.

-   **Location:** Co-located with components (src/components/MyComponent/MyComponent.test.tsx) or in a dedicated tests folder.

### 10.3 Integration Testing

-   **Backend API:** Use **Jest** combined with **Supertest**. Spin up an instance of the Express app in memory, send actual HTTP requests to its endpoints, and assert responses. Mock database layer or use a dedicated test database container.

-   **Frontend:** Can involve testing interactions between multiple components using RTL, potentially mocking API responses via tools like msw (Mock Service Worker).

-   **Location:** tests/integration folder within relevant packages.

### 10.4 End-to-End (E2E) Testing

-   **Framework:** Use **Playwright**.

-   **Scope:** Test critical user flows from start to finish in a real browser environment (targeting Chromium, Firefox, WebKit). Interact with the UI as a user would.

    -   Examples: Campaigner registers -> logs in -> creates campaign -> pays -> creates letter template. General user browses -> selects letter -> provides details -> pays -> (verify backend state/mocked external calls).

-   **Environment:** Run against a fully running local stack (via docker compose) or a dedicated staging environment. Requires handling authentication flows (potentially seeding test users in Keycloak or using test credentials).

-   **Configuration:** Setup Playwright config (playwright.config.ts), define base URL, browser targets, potentially parallel execution.

-   **Location:** Separate E2E test package (packages/e2e-tests) or within frontend/tests/e2e.

### 10.5 Test Execution in CI

-   All test suites (unit, component, integration, E2E) **MUST** be executable via pnpm scripts and integrated into the GitHub Actions ci.yml workflow. E2E tests might run as a separate job or stage due to longer execution time.

11\. Configuration Management
-----------------------------

### 11.1 Environment Variables

-   **Requirement:** Externalize all configuration that varies between environments (local, staging, production) or contains sensitive data.

-   **Mechanism:** Use **environment variables**.

### 11.2 Local Development (.env file)

-   **Requirement:** Use a .env file at the monorepo root to store configuration for the local Docker Compose environment.

-   **Loading:** docker-compose.yml loads variables from the .env file using env_file: .env or directly referencing variables ${VAR_NAME}.

-   **`.env.example`:**

    -   **Requirement:** Provide an .env.example file in the root directory, listing all required environment variables with placeholder or default values. **NEVER** commit the actual .env file.

        -   **Content Example (**

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

-   **Frontend Access:** Frontend code (Vite) can only access environment variables prefixed with VITE_. These are embedded during the build process and are **publicly visible**. Do not put secrets here.

### 11.3 Staging/Production (Kubernetes)

-   **Non-Sensitive Config:** Use **Kubernetes ConfigMaps**. Create separate ConfigMaps for each environment (via Kustomize overlays). Mount values as environment variables or files into containers.

-   **Sensitive Config:** Use **Kubernetes Secrets**. Create secrets (e.g., using kubectl create secret generic ... --from-literal=... or from files) per environment. Mount values as environment variables or files. **Strongly recommend integrating with GCP Secret Manager** using the Secrets Store CSI Driver for more secure secret injection. Never store plain secrets in Git.

12\. External Integrations (Detailed)
-------------------------------------

-   **Stripe:**

    -   Requires Publishable Key (VITE_STRIPE_PUBLISHABLE_KEY - public) and Secret Key (STRIPE_SECRET_KEY - secret). Webhook Secret (STRIPE_WEBHOOK_SECRET - secret) needed for verifying webhook events.

    -   Frontend uses Stripe.js with Publishable Key.

    -   Stripe Proxy uses Secret Key via stripe-node SDK (using axios is less common than SDK). Handles Payment Intents and Webhooks. Must be PCI DSS compliant.

-   **ClickSend:**

    -   Requires Username (CLICKSEND_USERNAME - potentially sensitive) and API Key (CLICKSEND_API_KEY - secret).

    -   ClickSend Proxy uses credentials with axios to call the Post Letter API. GDPR/CCPA apply to address data transferred.

-   **Email Relay (SendGrid/etc.):**

    -   Requires API Key or SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - secrets).

    -   Email Proxy (or Backend) uses credentials with SDK or nodemailer. Requires domain verification (SPF, DKIM) for deliverability.

-   **Keycloak:**

    -   Frontend (keycloak-js): Needs Keycloak URL, Realm, Client ID (VITE_KEYCLOAK_... - public).

    -   Backend (Token Validation): Needs Keycloak URL, Realm (KEYCLOAK_... - non-secret) to fetch JWKS keys and verify token issuer.

-   **Facebook/Instagram IdP Brokering:**

    -   Requires setting up Developer Apps on Facebook/Meta platform.

    -   Obtain App ID and App Secret for each.

    -   Configure these credentials securely within Keycloak's Identity Provider settings for Facebook/Instagram. Keycloak handles the OAuth flow with these platforms.

13\. Implementation Checklist / Task Breakdown
----------------------------------------------

**(High-level phases, detailed tasks within each)**

**Phase 0: Project Setup & Foundation (Sprint 0)**

-   Initialize Git repository.

-   Set up monorepo structure (pnpm workspaces, directories).

-   Configure root package.json, pnpm-workspace.yaml.

-   Configure basic linting/formatting (ESLint, Prettier) at root.

-   Configure Husky, lint-staged, commitlint for pre-commit/commit-msg hooks (scripts/setup-hooks.sh).

-   Configure Conventional Changelog.

-   Set up basic .gitignore, .dockerignore, .editorconfig.

-   Create initial README.md.

-   Set up .vscode settings, extensions recommendations.

-   Create initial docker-compose.yml with core services (Postgres, Mongo, Keycloak).

-   Configure basic Keycloak realm, admin user via Docker Compose env vars.

-   Implement local TLS setup (mkcert, scripts/setup-certs.sh).

-   Create basic scripts/dev.sh.

-   Create .env.example.

-   Set up basic GitHub Actions workflow for CI (ci.yml - checkout, install, basic lint).

**Phase 1: Authentication & Core Backend/Frontend Setup**

-   Scaffold Frontend package (npx create-vite@latest frontend --template react-ts).

    -   Configure tsconfig.json (paths aliases @/*).

    -   Install and configure React Router.

    -   Install and setup **Material UI (MUI)** core, icons. Configure basic theme provider.

    -   Install keycloak-js.

    -   Implement basic layouts (Header, Footer, Main Content area) using MUI, responsive structure.

    -   Implement basic public/protected route structure using React Router.

    -   Implement Keycloak initialization and login/logout flow triggering using keycloak-js.

    -   Setup basic state management for auth status.

    -   Create wrapper/utility for fetch to automatically add Auth header.

-   Scaffold Backend API package (packages/backend-api).

    -   Initialize Node.js project (pnpm init), install Express, Axios, etc.

    -   Setup basic Express server structure (app.js/server.js, routes, controllers, services).

    -   Implement health check endpoint (/healthz).

    -   Implement JWT validation middleware using jsonwebtoken, jwks-rsa targeting Keycloak JWKS endpoint.

    -   Create example protected API route.

    -   Configure basic CORS settings.

    -   Setup Mongoose and connect to MongoDB container.

-   Configure Keycloak Realm:

    -   Create Realm (myrealm).

    -   Create Frontend client (myfrontend-client, public, standard flow, configure redirect URIs: https://localhost/*).

    -   Create Backend client (mybackend-client, public/bearer-only - for audience check).

    -   Create Campaigner role.

    -   Configure IdP Brokering for Email (default), Facebook, Instagram (requires dev app setup on platforms).

-   Update Docker Compose (frontend, backend-api services, Keycloak realm import).

-   Update dev.sh, .env.example.

-   Implement basic unit/integration tests for backend auth middleware.

-   Implement basic component tests for frontend login/routing components.

-   Update CI workflow to include tests for frontend/backend.

-   Configure NGINX service in Docker Compose to proxy frontend dev server and backend API, apply local TLS.

**Phase 2: Core Feature Implementation (Campaigns, Letters, Payment)**

-   Backend: Implement Campaign CRUD API endpoints (protected for Campaigners). Define Mongoose schema.

-   Backend: Implement Letter Template CRUD API endpoints (protected). Define Mongoose schema.

-   Frontend: Implement Campaign creation/editing forms using MUI components.

-   Frontend: Implement Letter Template creation/editing forms using MUI components.

-   Backend: Scaffold Stripe Proxy service. Implement endpoint to create Payment Intent (for campaign creation fee).

-   Frontend: Integrate Stripe.js Elements with MUI for campaign creation payment form. Handle payment confirmation flow.

-   Backend: Implement Stripe Webhook handler in Stripe Proxy (securely validate signature). Update Campaign status on payment_intent.succeeded.

-   Frontend: Implement campaign browsing/viewing for General Users.

-   Frontend: Implement letter selection and recipient/sender address forms for General Users.

-   Backend: Implement API endpoint to calculate letter sending cost.

-   Backend: Update Stripe Proxy to create Payment Intent for letter sending cost.

-   Frontend: Implement Stripe payment flow for letter sending.

-   Backend: Scaffold PDF Creator service. Implement PDF generation endpoint using PDFKit.

-   Backend: Scaffold ClickSend Proxy service. Implement endpoint to call ClickSend Post Letter API.

-   Backend: Implement logic to: validate letter payment (via webhook) -> generate PDFs -> call ClickSend Proxy.

-   Backend: Scaffold Email Proxy service (or integrate into backend). Implement email sending logic for receipts/notifications.

-   Add relevant unit, integration, and E2E tests (Playwright) for these core flows.

-   Update Docker Compose for new microservices. Update .env.example.

-   Configure VS Code debug for microservices. Add REST client examples.

**Phase 3: GDPR/CCPA, Testing Refinement, DX Polish**

-   Implement GDPR/CCPA features: Consent mechanisms, update Privacy Policy, implement data retention logic (especially for General User addresses), document DSAR process for Campaigners.

-   Refine and expand test coverage (unit, component, integration, E2E) across all packages. Setup Playwright project structure.

-   Polish UI/UX based on testing and feedback, ensure responsiveness across target devices. Ensure MUI theming is consistent.

-   Refine dev.sh script, VS Code debug configs, REST client examples.

-   Ensure Conventional Commits are being followed, CHANGELOG.md generated correctly.

**Phase 4: Production Preparation & Deployment**

-   Create Kubernetes manifests (infra/k8s/base and overlays).

    -   Define Deployments, Services, Ingress, ConfigMaps, Secrets structures.

    -   Configure probes, resource limits, security contexts.

    -   Setup Network Policies.

    -   Configure persistent volumes for databases (if not using managed).

    -   Integrate secret management (e.g., GCP Secret Manager CSI driver).

-   Refine Dockerfiles for production (multi-stage builds, security hardening).

-   Build and test production Docker images.

-   Set up GCR repository.

-   Set up GKE cluster (staging, production environments).

-   Configure DNS, SSL certificates (cert-manager or managed) for staging/production domains.

-   Implement GitHub Actions deployment workflows (deploy-staging.yml, deploy-prod.yml) using Kustomize.

-   Configure production Keycloak settings (disable dev mode, secure admin access, potentially HA setup).

-   Configure production database backups and monitoring.

-   Set up GCP Cloud Logging/Monitoring (or alternatives). Configure alerts.

-   Perform security audit/penetration testing (optional but recommended).

-   Deploy to Staging environment. Perform thorough testing (including E2E).

-   Deploy to Production environment. Monitor closely.

14\. Future Considerations
--------------------------

-   **Service Mesh (Istio/Linkerd):** For advanced mTLS, traffic management, observability as microservice count grows.

-   **Distributed Tracing (Jaeger/Tempo):** Track requests across services for debugging.

-   **Caching (Redis):** Improve performance for frequently accessed, non-volatile data.

-   **Advanced Scalability:** Database read replicas, CQRS pattern if write/read loads diverge significantly.

-   **Feature Expansion:** User registration for General Users, saved drafts, send history, admin roles, image uploads, advanced templates, Campaigner-defined recipient lists.

-   **Alternative Monorepo Tools:** Evaluate Nx or Turborepo if build/test performance becomes a bottleneck.

15\. Appendices
---------------

### 15.1 Glossary

(Includes previous terms plus new ones)

-   **API:** Application Programming Interface

-   **Axios:** Promise-based HTTP client for Node.js.

-   **CCPA:** California Consumer Privacy Act

-   **CDN:** Content Delivery Network

-   **CI/CD:** Continuous Integration / Continuous Delivery

-   **Conventional Commits:** Specification for adding human and machine readable meaning to commit messages.

-   **CSP:** Content Security Policy

-   **DSAR:** Data Subject Access Request

-   **DX:** Developer Experience

-   **E2E:** End-to-End (Testing)

-   **Fetch API:** Browser built-in interface for fetching resources.

-   **GCP:** Google Cloud Platform

-   **GDPR:** General Data Protection Regulation

-   **GKE:** Google Kubernetes Engine

-   **HMR:** Hot Module Replacement

-   **HPA:** Horizontal Pod Autoscaler

-   **HSTS:** HTTP Strict Transport Security

-   **Husky:** Tool for managing Git hooks.

-   **IdP:** Identity Provider

-   **IAM:** Identity and Access Management

-   **IDOR:** Insecure Direct Object Reference

-   **JWT:** JSON Web Token

-   **JWKS:** JSON Web Key Set

-   **K8s:** Kubernetes

-   **Kustomize:** Tool for customizing Kubernetes object configuration.

-   **Lint-Staged:** Tool to run linters on staged Git files.

-   **LTS:** Long-Term Support (Node.js version)

-   **mkcert:** Tool for making locally-trusted development certificates.

-   **Monorepo:** Single repository containing multiple distinct projects/packages.

-   **mTLS:** Mutual Transport Layer Security

-   **MUI:** Material UI (React component library).

-   **NGINX:** High-performance web server and reverse proxy.

-   **OIDC:** OpenID Connect

-   **OWASP:** Open Web Application Security Project

-   **PCI DSS:** Payment Card Industry Data Security Standard

-   **PDFKit:** PDF generation library for Node.js.

-   **PKCE:** Proof Key for Code Exchange (OIDC security extension).

-   **PNPM:** Performant npm client, good for monorepos.

-   **PRD:** Project Requirements Document

-   **RBAC:** Role-Based Access Control

-   **RTL:** React Testing Library

-   **SDK:** Software Development Kit

-   **SPA:** Single-Page Application

-   **SSO:** Single Sign-On

-   **SSRF:** Server-Side Request Forgery

-   **Supertest:** Library for testing Node.js HTTP servers.

-   **TLS:** Transport Layer Security

-   **Vite:** Frontend build tool and development server.

-   **WCAG:** Web Content Accessibility Guidelines