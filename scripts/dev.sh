#!/bin/bash
set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$PROJECT_ROOT/certs"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

echo -e "${BLUE}=== GoGetAction Local Development Startup ===${NC}"

# Check if .env file exists, if not create from example
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Check if TLS certificates exist
if [ ! -f "$CERT_DIR/localhost.pem" ] || [ ! -f "$CERT_DIR/localhost-key.pem" ]; then
  echo -e "${YELLOW}⚠️  Local TLS certificates not found. Generating...${NC}"
  
  # Check if mkcert is installed
  if command -v mkcert &> /dev/null; then
    # Generate certificates without installing CA
    mkdir -p "$CERT_DIR"
    mkcert -cert-file "$CERT_DIR/localhost.pem" -key-file "$CERT_DIR/localhost-key.pem" localhost 127.0.0.1 ::1
    echo -e "${GREEN}✓ TLS certificates generated${NC}"
    echo -e "${YELLOW}⚠️  Note: Your browser will show security warnings as these are self-signed certificates${NC}"
  else
    # Fallback to OpenSSL if mkcert isn't installed
    if command -v openssl &> /dev/null; then
      echo -e "${YELLOW}mkcert not found, using OpenSSL instead...${NC}"
      mkdir -p "$CERT_DIR"
      openssl genrsa -out "$CERT_DIR/localhost-key.pem" 2048
      openssl req -new -x509 -key "$CERT_DIR/localhost-key.pem" -out "$CERT_DIR/localhost.pem" -days 365 -subj "/CN=localhost" -addext "subjectAltName = DNS:localhost,IP:127.0.0.1,IP:::1"
      echo -e "${GREEN}✓ Self-signed certificates generated with OpenSSL${NC}"
      echo -e "${YELLOW}⚠️  Your browser will show security warnings as these are self-signed certificates${NC}"
    else
      echo -e "${RED}✗ Neither mkcert nor openssl is installed. Please install one of them:${NC}"
      echo -e "   brew install openssl"
      exit 1
    fi
  fi
else
  echo -e "${GREEN}✓ TLS certificates found${NC}"
fi

# Start services with Docker Compose
echo -e "${BLUE}Starting services with Docker Compose...${NC}"
cd "$PROJECT_ROOT"
docker compose up --build -d

# Show services status
echo -e "${GREEN}✓ Services started!${NC}"
docker compose ps

echo -e "\n${GREEN}=== Local Development Environment is Ready! ===${NC}"
echo -e "Frontend:  ${BLUE}https://localhost${NC}"
echo -e "API:       ${BLUE}https://localhost/api/health${NC}"
echo -e "Keycloak:  ${BLUE}http://localhost:8080${NC} (admin:${YELLOW}see KEYCLOAK_ADMIN_PASSWORD in .env${NC})"
echo -e "\n${YELLOW}Note: Your browser will show security warnings when accessing HTTPS URLs${NC}"
echo -e "${YELLOW}This is normal with self-signed certificates. You can safely proceed by clicking through the warnings.${NC}"