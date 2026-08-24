FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

EXPOSE 3000

# The startup command runs prisma db push to ensure the database schema is up to date, then starts the app
CMD ["sh", "-c", "npx prisma db push && npm start"]
