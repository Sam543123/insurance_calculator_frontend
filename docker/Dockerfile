FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY public public/
COPY src src/
RUN npm install
CMD ["npm", "start", "--host", "0.0.0.0"]