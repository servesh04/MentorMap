# Stage 1: Build the React Application
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first (caches this step if package.json hasn't changed)
COPY package*.json ./
RUN npm ci

# Copy the rest of the code and build
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clear out the default Nginx placeholder files
RUN rm -rf ./*

# Copy your built React app from Stage 1
# Note: Change '/app/dist' to '/app/build' if you are using Create React App instead of Vite
COPY --from=builder /app/dist .

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Cloud Run
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]