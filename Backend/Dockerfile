FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json* yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy application code
COPY . .

# Build application
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

EXPOSE 8000

CMD ["node", "dist/main"]
