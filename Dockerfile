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

EXPOSE 3000

CMD ["sh", "-c", "node dist/main"]