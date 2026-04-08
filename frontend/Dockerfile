# ── Stage 1: build ─────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# ── Stage 2: runtime ───────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copia apenas o necessário para rodar em produção
COPY --from=build /app/package*.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
