# syntax=docker/dockerfile:1

# Three stages: install dependencies, build, then a small runtime image that only
# holds Next's standalone server output.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The site's .env is mounted as a build secret (so it never lands in an image layer).
# Next reads .env.production.local at build time, which covers both the NEXT_PUBLIC_*
# values that get inlined into the JS and the API keys used while prerendering pages.
RUN --mount=type=secret,id=build_env,target=/app/.env.production.local \
    npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Blog posts and case studies are read from disk at runtime (src/lib/blog.ts), and
# Next's file tracing doesn't pick up a folder it only sees through process.cwd().
COPY --from=builder --chown=node:node /app/content ./content
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
