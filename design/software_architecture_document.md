# Software Architecture Document

## 1. Introduction

This document outlines the comprehensive architecture for a web application built using best practices in web development, deployment, and security. The application leverages Docker containers for isolation, scalability, and portability, with deployment targeted on Google Cloud Platform (GCP) using Google Kubernetes Engine (GKE).

### Objectives and Constraints:

- Secure, performant, maintainable, and scalable application.

- Compliance with OWASP security standards.

- Clear separation between development and production environments.

- Leverage existing official Docker images where available.

- Robust Identity and Access Management (IAM) using Keycloak.

### Technical Stack Components:

- Frontend: React (TypeScript, Vite)

- Backend: Node.js (Express)

- IAM: Keycloak

- Databases: MongoDB, PostgreSQL

- PDF Generation: Node.js + PDFKit

- Payments: Stripe

- Communications: ClickSend, SendGrid (or alternative SMTP)

- Reverse Proxy: OpenResty (NGINX with enhanced Lua scripting capabilities for Keycloak integration)

---

## 2. Architectural Overview

### High-Level Architecture

```
graph TD
    User -->|HTTPS| OpenResty
    OpenResty --> React
    OpenResty --> NodeExpress[Node.js Express API]
    OpenResty --> Keycloak[Keycloak IAM]

    Keycloak --> PostgreSQL

    NodeExpress --> MongoDB
    NodeExpress --> PDFCreator[Node.js PDF Service]
    NodeExpress --> StripeProxy[Node.js Stripe Proxy]
    NodeExpress --> ClickSendProxy[Node.js ClickSend Proxy]
    NodeExpress --> EmailProxy[Node.js Email Service]

    StripeProxy --> Stripe
    ClickSendProxy --> ClickSend
    EmailProxy --> EmailRelay[SMTP Relay Service]
```

### Component Responsibilities:

- **OpenResty (NGINX)**: Reverse proxy with SSL termination, JWT authentication via Keycloak using enhanced Lua scripting.

- **React**: Single-page application frontend.

- **Node.js Express API**: Handles business logic, data management, and backend processes.

- **Keycloak**: Identity and access management.

- **MongoDB**: Non-relational data storage.

- **PostgreSQL**: Persistent storage for IAM data (Keycloak).

- **PDF Service**: Generates PDFs from JSON input using PDFKit.

- **Stripe Proxy**: Handles secure payment transactions with Stripe.

- **ClickSend Proxy**: Forwards communication requests to ClickSend API.

- **Email Service**: Sends email via SMTP (SendGrid or alternative).

---

## 3. Docker Containerization Strategy

Each application component will run in its own Docker container using official or custom images based on Alpine Linux whenever possible for enhanced security and efficiency.

### Docker Images and Container Recommendations:

| Component | Recommended Docker Image |
| OpenResty Reverse Proxy | `openresty/openresty:alpine` (Docker Hub official) |
| React UI | Custom Dockerfile based on `node:alpine`, builds static files served by OpenResty |
| Node.js Express Backend | `node:alpine` (Docker Hub official) |
| Keycloak IAM | `quay.io/keycloak/keycloak:latest` (Docker official, production-ready) |
| PostgreSQL | `postgres:alpine` (Docker Hub official) |
| MongoDB | `mongo:latest` (official Docker image; Alpine not officially available) |
| PDF Creation Service (Node.js + PDFKit) | Custom Dockerfile based on `node:alpine` |
| Stripe Payment Proxy | Custom Dockerfile based on `node:alpine` |
| ClickSend Proxy | Custom Dockerfile based on `node:alpine` |
| Email Service (SMTP) | Use SendGrid if official image available; otherwise, generic SMTP relay image like `namshi/smtp` or Mailgun SMTP |

### Docker Network Configuration (Development):

Use Docker Compose for local development. Each container accessible independently via exposed ports. Example Docker Compose configuration snippet:

```
version: '3.9'
services:
  openresty:
    image: openresty/openresty:alpine
    ports:
      - "443:443"
    volumes:
      - ./openresty/conf:/etc/nginx/conf.d

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

  backend:
    build: ./backend
    ports:
      - "5000:5000"

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=secret
    ports:
      - "8080:8080"

  postgres:
    image: postgres:alpine
    environment:
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_DB=keycloak

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
```

Containers are accessible directly during development. In production, access is strictly through OpenResty.

## 4. Identity and Access Management (IAM) - Keycloak Integration

Keycloak will serve as the Identity and Access Management solution, integrated via JWT tokens handled by OpenResty's Lua scripting and verified by the Node.js backend.

### Integration Strategy:

- OpenResty configured with Lua middleware to validate JWT tokens from Keycloak.

- JWT tokens issued by Keycloak upon user authentication.

- JWT tokens verified by Node.js Express routes.

### Keycloak Setup (Production-Grade):

- Hosted in a Docker container using the official production-grade image (`quay.io/keycloak/keycloak:latest`).

- PostgreSQL database for persistent IAM data.

- Highly available configurations for reliability.

---

## 5. Frontend and Backend Architectural Considerations

### Frontend (React):

- Build static assets using Vite (TypeScript).

- Containerized and served efficiently by OpenResty.

- Ensure strict Content Security Policy (CSP) headers via OpenResty.

### Backend (Node.js Express):

- Implemented using JavaScript and OOP classes where practical.

- Structured into routes, controllers, and services.

- Adherence to REST API standards.

- JWT authentication middleware.

- OWASP secure coding practices (input validation, secure session management).

## 6. Security Guidelines (OWASP Standards)

### OWASP Top 10 Mitigation Strategies:

- **Injection**: Use parameterized queries, input validation.

- **Broken Authentication**: Implement Keycloak with strong JWT-based authentication.

- **Sensitive Data Exposure**: Enforce TLS, securely handle secrets using environment variables.

- **XML External Entities (XXE)**: Disable XML parsing or securely configure XML parsers.

- **Broken Access Control**: Properly implement JWT roles and permissions.

- **Security Misconfiguration**: Automate secure configuration via Docker Compose and Kubernetes manifests.

- **Cross-Site Scripting (XSS)**: Strict CSP policies, input/output sanitization.

- **Insecure Deserialization**: Avoid unsafe deserialization; prefer JSON with validation.

- **Components with Known Vulnerabilities**: Regular dependency scanning via Dependabot/Snyk.

- **Insufficient Logging and Monitoring**: Implement centralized logging and monitoring tools (e.g., Stackdriver, Prometheus/Grafana).

## 7. Environment-Specific Configuration

- Clearly separate environment configurations using Docker Compose files and Kubernetes manifests.

- Local development uses self-signed certificates; production environment employs certificate authority (CA)-signed certificates.

- Environment variables managed through `.env` files for local development and Kubernetes Secrets for GCP deployments.

## 8. CI/CD Implementation Guidelines

### Continuous Integration and Delivery

- Utilize GitHub Actions for automated CI/CD pipelines.

- Automated testing with Jest for frontend and backend.

- Automated security scanning with Dependabot and Snyk.

- Docker image builds automated upon pull requests and merges to `main` branch.

### GitHub Actions Workflow:

- Code checkout

- Run automated tests

- Security scans (Snyk/Dependabot)

- Docker build and push to Google Container Registry (GCR)

- Kubernetes deployment automation using Kubernetes manifests or Helm charts

---

## 9. GCP Deployment Strategy

### Kubernetes Deployment (GKE)

- Google Kubernetes Engine (GKE) clusters for container orchestration.

- Use Kubernetes Ingress for external access.

- SSL termination at ingress (integrated with Cloudflare for CDN and DNS management).

### Recommended GCP Components:

- Google Container Registry (GCR) for Docker image storage.

- Kubernetes Secrets and ConfigMaps for secure configuration management.

- Google Cloud Load Balancer or Cloudflare for global traffic management.

---

## 10. Operations, Maintenance, and Security Management

### Logging, Monitoring, and Alerting

- Stackdriver Logging for centralized log management.

- Prometheus and Grafana or Stackdriver Monitoring for infrastructure and application metrics.

- Alert policies to notify DevOps on anomalies or security incidents.

### Incident Response and Backup Strategy

- Regular backup schedule for databases.

- Disaster recovery plan including snapshot and restore procedures.

- Clearly defined incident response protocols.

### Maintenance Practices

- Regular dependency updates and vulnerability management.

- Scheduled downtime for infrastructure maintenance and updates.

- Continuous training and knowledge sharing among the team.
