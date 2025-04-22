FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy source code
COPY src ./src

# Expose the application port
EXPOSE 5000

# Use node user for better security
USER node

# Start the application
CMD ["node", "src/server.js"]