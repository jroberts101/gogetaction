# gogetaction

A modern, secure, and scalable web application platform leveraging containerization and cloud-native best practices.

## Overview

This repository contains the source code and configuration for a web application designed with the following principles:

- **Security**: Compliance with OWASP standards, robust IAM via Keycloak, and secure-by-default configurations.
- **Scalability & Maintainability**: Microservices architecture, Docker containerization, and Kubernetes orchestration (GKE).
- **Separation of Concerns**: Distinct frontend, backend, IAM, and supporting services.

## Architecture

- **Frontend**: React (TypeScript, Vite), built and served as static assets.
- **Backend**: Node.js (Express), structured with routes, controllers, and services.
- **Identity & Access Management**: Keycloak (with PostgreSQL).
- **Databases**: MongoDB (application data), PostgreSQL (IAM).
- **Supporting Services**: PDF generation (Node.js + PDFKit), Stripe payments, ClickSend communications, SMTP email (SendGrid or alternative).
- **Reverse Proxy**: NGINX for request routing and SSL termination.

All components are containerized using Docker, with orchestration via Docker Compose (development) and Kubernetes (production).

## Current Implementation

The project is currently implemented with the following components:

- **Docker Compose** orchestration for local development, including:
  - NGINX reverse proxy handling routing and TLS termination
  - React frontend (Vite dev server)
  - Node.js backend API server running on port 5001
  - Keycloak for identity and access management
  - PostgreSQL database for Keycloak
  - MongoDB database for application data

### Technology Stack Details

- **Frontend**:

  - React 19.0.0 with TypeScript
  - Material UI 7.0.x for component styling
  - React Router 7.5.x for client-side routing
  - Vite 6.3.x for development server and build tooling
  - Keycloak JS client for authentication

- **Backend API**:

  - Express 5.1.x (Node.js framework)
  - MongoDB with Mongoose for data persistence
  - JWT authentication integrated with Keycloak
  - RESTful API architecture

- **Infrastructure**:
  - NGINX for request routing and SSL termination
  - Self-signed certificates for local HTTPS development
  - Docker and Docker Compose for containerization

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git for version control
- Node.js and pnpm (for local development outside containers)
- mkcert (recommended) or OpenSSL for certificate generation

### Development Environment Setup

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd gogetaction
   ```

2. **Run the development setup script**:

   ```bash
   ./scripts/dev.sh
   ```

   This script will:

   - Check for and create a `.env` file if not present
   - Generate self-signed certificates for HTTPS development
   - Build and start all services using Docker Compose

3. **Verify services are running**:

   ```bash
   docker compose ps
   ```

   You should see all services (nginx, frontend, backend-api, keycloak, postgres, mongo) running.

### Manual Setup (if not using the script)

1. **Create an .env file**:
   Copy the example file and adjust as needed:

   ```bash
   cp .env.example .env
   ```

2. **Generate TLS certificates**:

   ```bash
   mkdir -p certs
   mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1 ::1
   ```

3. **Start the services**:
   ```bash
   docker compose up -d
   ```

## Accessing the Application

After setup, the following services will be available:

- **Frontend**: https://localhost
- **Backend API**: https://localhost/api/health
- **Keycloak Admin Console**: http://localhost:8080
  - Default credentials can be found in your .env file (default: admin/admin123)

**Note**: Your browser will show security warnings when accessing HTTPS URLs due to the self-signed certificates. This is expected in a development environment.

## Testing the Application

### Basic Functionality Test

1. **Test the Backend Health Endpoint**:

   ```bash
   curl -k https://localhost/api/health
   ```

   Expected response:

   ```json
   { "status": "ok", "message": "Backend API is healthy" }
   ```

2. **Access the Frontend**:

   - Open https://localhost in your browser
   - Accept the security warning about the self-signed certificate
   - Verify that the React application loads properly

3. **Verify Keycloak Integration**:
   - Access the Keycloak admin console at http://localhost:8080
   - Log in with the admin credentials from your .env file
   - Create a new realm called "gogetaction" (if not already present)
   - Create a client for your frontend application
   - Configure the client settings as needed for your frontend authentication

### Development Workflow

1. **Frontend Development**:

   - The frontend code is mounted as a volume in the container
   - Changes to the frontend code will be automatically reflected due to Vite's hot module replacement

2. **Backend Development**:

   - The backend code is mounted as a volume in the container
   - Changes to the backend code will be automatically reflected due to nodemon
   - Debug port 9229 is exposed for Node.js debugging

3. **Container Logs**:

   ```bash
   # View logs for a specific service
   docker compose logs -f frontend
   docker compose logs -f backend-api

   # View all logs
   docker compose logs -f
   ```

## Deployment

- **Development**: Use Docker Compose for local development and testing.
- **Production**: Deploy to Google Cloud Platform using Google Kubernetes Engine (GKE), with secure ingress, managed secrets, and centralized logging/monitoring.

## CI/CD

- Automated testing, security scanning, Docker builds, and deployments via GitHub Actions.

## Security

- Enforced TLS, strict Content Security Policy, JWT authentication, and regular dependency scanning.
- Keycloak provides robust identity and access management
- HTTPS enforced even in development environment

## Commit Guidelines

This project uses conventional commit messages with commitlint validation:

```
type(scope): subject
```

where `type` is one of:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or fixing tests
- `chore`: Changes to build process, tools, etc.

Example valid commit message:

```
fix(backend-api): change default server port from 5000 to 5001
```

---

See `project-requirements-document.md` for full requirements details.
See `software_architecture_document.md` for full architectural details.
