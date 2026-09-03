# Build and runtime stage for Node.js Backend
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install build dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Create uploads directory with write permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]
