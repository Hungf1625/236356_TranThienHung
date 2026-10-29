FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public

ARG VITE_API_URL=https://api-236356.onrender.com/api/foods
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
