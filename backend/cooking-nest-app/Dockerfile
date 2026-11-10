# Image de production du backend (utilisée par docker-compose.prod.yml)

FROM node:22-alpine AS build
WORKDIR /app
# Pas de téléchargement du binaire MongoDB des tests E2E (mongodb-memory-server)
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json .npmrc ./
RUN npm install
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Dossier des images uploadées (monté sur un volume)
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
