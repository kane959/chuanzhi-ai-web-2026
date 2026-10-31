FROM node:20-bookworm-slim AS build

WORKDIR /app
RUN corepack enable

COPY prototype/package.json prototype/
RUN pnpm --dir prototype install --no-frozen-lockfile

COPY . .
RUN pnpm --dir prototype build

FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app/server ./server
COPY --from=build /app/prototype/dist ./prototype/dist

EXPOSE 8080
CMD ["node", "server/index.mjs"]
