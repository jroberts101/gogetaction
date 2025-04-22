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
  if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}✗ mkcert is not installed. Please install it first:${NC}"
    echo -e "   brew install mkcert"
    echo -e "   mkcert -install"
    exit 1
  fi
  
  # Generate certificates
  mkdir -p "$CERT_DIR"
  mkcert -key-file "$CERT_DIR/localhost-key.pem" -cert-file "$CERT_DIR/localhost.pem" localhost 127.0.0.1 ::1
  echo -e "${GREEN}✓ TLS certificates generated${NC}"
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