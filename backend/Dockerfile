FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Using standard array syntax safely handles background process terminations
CMD ["sh", "-c", "npm run db:migrate && npm start"]
