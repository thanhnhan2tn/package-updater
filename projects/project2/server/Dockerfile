# Project2 Server Dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
