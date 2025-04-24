# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first for better caching
COPY package.json ./

# Install dependencies including devDependencies needed for build
RUN pnpm install --frozen-lockfile=false

# Make sure TypeScript is installed and available
RUN ls -la node_modules/.bin/

# Copy the rest of the application code
COPY . .

# Build the application
RUN node_modules/.bin/tsc -b && node_modules/.bin/vite build

# Production stage
FROM nginx:alpine AS production

# Copy built files from the build stage to NGINX html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]