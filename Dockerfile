FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install --production

COPY server.js .
COPY utils.js .
COPY db.js .

ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]