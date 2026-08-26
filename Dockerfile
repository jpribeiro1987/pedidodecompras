FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Store the fresh schema somewhere safe so it isn't overwritten by the volume
COPY prisma/schema.prisma /app/schema.prisma.new

# Build the Next.js app
RUN npm run build

EXPOSE 8080

# The startup command copies the new schema to the volume, runs prisma db push to ensure the database schema is up to date, then starts the app
CMD ["sh", "-c", "cp /app/schema.prisma.new /app/prisma/schema.prisma && npx prisma db push && npm start"]
