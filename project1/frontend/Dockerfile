# Stage 1: Build Frontend
FROM 1:slim AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve Frontend
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
