FROM node:20-alpine AS builder

WORKDIR /app

COPY container/package.json container/package-lock.json* ./
RUN npm ci

COPY container/server.ts container/tsconfig.json ./
COPY agents ./agents
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY container/package.json container/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Copy agent configuration and prompt files alongside compiled JS
COPY --from=builder /app/agents ./dist/agents

# Copy skills to project-level directory for auto-discovery
COPY .claude ./.claude

# Change ownership and switch to non-root user (required for bypassPermissions mode)
RUN chown -R node:node /app
USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
