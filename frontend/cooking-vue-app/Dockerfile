# Image de production du frontend : build Vue servi par nginx,
# qui relaie aussi /data et /uploads vers le backend (voir nginx.conf)

FROM node:22-alpine AS build
WORKDIR /app
# Pas de téléchargement du binaire Cypress (tests uniquement)
ENV CYPRESS_INSTALL_BINARY=0
COPY package.json .npmrc ./
RUN npm install
COPY . .
RUN npm run build-only

FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
