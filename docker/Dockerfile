# Stage 1: install deps, typecheck the app, and produce a seed static build.
# Node 24 (current LTS) is required — the content pipeline and runtime
# rebuild scripts run as plain `node scripts/*.ts` relying on Node's native
# TypeScript support, which is only unflagged/stable from Node 23.6+.
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN node scripts/build-nginx-config.ts

# Stage 2: runtime — serves the prerendered site and rebuilds it live when
# content/ changes (see scripts/watch-content.ts, scripts/rebuild-site.ts),
# without needing a new image build or container restart. This needs Node
# as well as nginx, unlike a purely static deploy — see README's
# "Deploying (Docker)" section for the tradeoffs.
FROM node:24-alpine AS runtime
RUN apk add --no-cache nginx && rm -rf /usr/share/nginx/html
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/index.html ./index.html
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/vite-media-plugin.ts ./vite-media-plugin.ts
COPY --from=build /app/tsconfig.json /app/tsconfig.app.json /app/tsconfig.node.json ./
COPY --from=build /app/schemas ./schemas
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src ./src
COPY --from=build /app/content ./content
COPY --from=build /app/dist ./dist

# Alpine's `nginx` package (unlike the upstream nginx.org build the
# `nginx:alpine` image compiles) includes /etc/nginx/http.d/*.conf inside
# its http{} block, not conf.d/ — conf.d is included at the top level here,
# where a `server{}` block isn't valid and fails to start.
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=build /app/docker/generated/security-headers.conf /etc/nginx/security-headers.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Seed the first release from the build stage's output and point the
# webroot at it via a symlink. scripts/rebuild-site.ts always atomically
# repoints this symlink at a freshly-built release rather than overwriting
# files in place, so nginx never serves a half-written build.
RUN mkdir -p /app/releases \
  && mv /app/dist /app/releases/seed \
  && ln -s /app/releases/seed /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
