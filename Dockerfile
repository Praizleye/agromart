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

# Verify the build produced the expected entry point. Fail loudly if not.
RUN echo "===== dist/ contents after build =====" && ls -la dist/ && \
    echo "===== verifying dist/main.js =====" && \
    test -f dist/main.js && echo "OK: dist/main.js exists" || (echo "FAIL: dist/main.js missing" && find dist -type f | head -50 && exit 1)

# Remove dev deps after build
RUN pnpm prune --prod

EXPOSE 3000

CMD ["sh", "-c", "node dist/main.js"]