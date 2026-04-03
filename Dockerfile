# ===============================================
# BUILD STAGE
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build both backend + frontend
RUN npm run build


# ===============================================
# PRODUCTION STAGE
# ===============================================
FROM node:20-alpine

WORKDIR /app

# Copy only needed files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Install only production deps
RUN npm install --omit=dev

EXPOSE 3000
ENV NODE_ENV=production

# Run compiled server
CMD ["node", "dist-server/server.js"]