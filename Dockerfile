FROM node:20-alpine

# Installer les dépendances système nécessaires pour sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json .

RUN npm install

COPY server.js .

# Créer le répertoire pour la DB
RUN mkdir -p /app/data

ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]