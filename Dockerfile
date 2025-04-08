# Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    else npm i; fi

# Copy application code
COPY . .

# Build the Docusaurus site
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built static files to Nginx serve directory
COPY --from=builder /app/build /app/build

COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
