# Use official Bun image
FROM oven/bun:1.2.17 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose backend port
EXPOSE 4000

# Start backend
CMD ["bun", "src/index.ts"]
