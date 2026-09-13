# syntax=docker/dockerfile:1

# Version épinglée : une reconstruction produit la même base qu'aujourd'hui.
FROM node:20.20.2-bookworm-slim AS base
WORKDIR /api
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# ---------------------------------------------------------------- dépendances
FROM base AS dependencies
# bcrypt est un module natif : ses outils de compilation restent confinés à
# cette étape, qui n'est jamais embarquée dans l'image finale.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# ------------------------------------------------- développement (docker compose)
FROM dependencies AS development
ENV NODE_ENV=development
COPY backend/ ./
CMD ["npm", "run", "start:dev"]
