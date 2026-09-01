# syntax=docker/dockerfile:1
#
# DEP-03 : image de production.
#
# L'image précédente (`FROM node:20` + `npm install` + `nest start`) embarquait
# toute la chaîne de développement, compilait à chaque démarrage, tournait en
# root et n'épinglait aucune version. Trois étapes séparent désormais les
# dépendances, la compilation et l'exécution.
#
# Le contexte de build est la RACINE du dépôt (cf. render.yaml / docker-compose),
# car l'API sert aussi les illustrations d'exercices depuis front-client/.

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

# ------------------------------------------------------------------- build
FROM dependencies AS build
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./
COPY backend/src ./src
RUN npm run build \
    && npm prune --omit=dev

# ------------------------------------------------- développement (docker compose)
FROM dependencies AS development
ENV NODE_ENV=development
COPY backend/ ./
CMD ["npm", "run", "start:dev"]

# --------------------------------------------------------------- production
FROM base AS production
ENV NODE_ENV=production

COPY --from=build --chown=node:node /api/node_modules ./node_modules
COPY --from=build --chown=node:node /api/dist ./dist
COPY --from=build --chown=node:node /api/package.json ./package.json

# Les illustrations d'exercices sont servies par l'API sur /images : sans elles
# l'application mobile affiche des vignettes vides. Le chemin correspond à
# celui attendu par ServeStaticModule (../../front-client/assets/images
# relativement à /api/dist).
COPY --chown=node:node front-client/assets/images /front-client/assets/images

# Exécution sans privilèges : l'utilisateur `node` existe dans l'image de base.
USER node

EXPOSE 3000

# `node` dispose de fetch en global : pas de curl à installer dans l'image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Démarrage direct du JavaScript compilé : plus de compilation au lancement.
CMD ["node", "dist/main.js"]
