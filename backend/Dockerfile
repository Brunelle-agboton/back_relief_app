FROM node:20

WORKDIR /api
COPY backend/package*.json ./

RUN npm install
COPY backend/. .

CMD ["npm", "run", "start:dev"]