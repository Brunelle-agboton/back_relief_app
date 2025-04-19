# Pour React Native en développement local (Web/Expo CLI uniquement)
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g expo-cli && npm install

COPY . .

EXPOSE 8081 19000 19001 19002
CMD ["npx", "expo", "start", "--tunnel"]