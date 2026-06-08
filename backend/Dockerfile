FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prisma
COPY prisma ./prisma
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
