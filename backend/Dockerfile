FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY configs ./configs
COPY models ./models

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
