FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ALL deps (including devDeps for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Remove dev deps after build
RUN pnpm prune --prod

EXPOSE 5687

CMD ["sh", "-c", "npx drizzle-kit migrate --config=drizzle.config.ts && node dist/main"]