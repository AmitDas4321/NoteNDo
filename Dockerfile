# ===============================================
# BUILD STAGE
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build frontend (Vite)
RUN npm run build


# ===============================================
# PRODUCTION STAGE
# ===============================================
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (Render / Docker)
EXPOSE 3000

# Environment
ENV NODE_ENV=production

# Start server
CMD ["node", "server.ts"]