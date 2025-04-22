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
- **Reverse Proxy**: OpenResty (NGINX with Lua scripting for JWT/Keycloak integration).

All components are containerized using Docker, with orchestration via Docker Compose (development) and Kubernetes (production).

## Deployment

- **Development**: Use Docker Compose for local development and testing.
- **Production**: Deploy to Google Cloud Platform using Google Kubernetes Engine (GKE), with secure ingress, managed secrets, and centralized logging/monitoring.

## CI/CD

- Automated testing, security scanning, Docker builds, and deployments via GitHub Actions.

## Security

- Enforced TLS, strict Content Security Policy, JWT authentication, and regular dependency scanning.

---

See `project-requirements-document.md` for full requirements details.
See `software_architecture_document.md` for full architectural details.
