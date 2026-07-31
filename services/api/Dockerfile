FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY services/api/package.json services/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN npm ci

COPY services/api services/api
COPY packages/contracts packages/contracts
COPY packages/domain packages/domain
RUN npm run build -w @ta-passando/api
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/services/api/dist ./services/api/dist
COPY --from=build --chown=app:app /app/services/api/package.json ./services/api/package.json

USER app
EXPOSE 8080
CMD ["node", "services/api/dist/server.js"]

