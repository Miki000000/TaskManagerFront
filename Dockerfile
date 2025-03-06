FROM oven/bun:latest AS build

WORKDIR /app

# Copy only package.json first to leverage caching
COPY package.json ./
COPY bun.lock ./
# Remove --production flag as we need build dependencies
RUN bun install --frozen-lockfile

# Copy all necessary config files
COPY tsconfig.json ./
COPY tailwind.config.cjs ./
COPY postcss.config.mjs ./
COPY app.config.ts ./
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN bun run build

# Use a smaller base image for production
FROM oven/bun:slim

WORKDIR /app

# Copy only the build output and runtime dependencies
COPY --from=build /app/.output ./.output
COPY --from=build /app/.vinxi ./.vinxi
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Command to run the application
CMD ["bun", "start"]
