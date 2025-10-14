

# Use Node.js as the base image for building the app
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Use a minimal Node.js image for production
FROM node:18-alpine as production

# Set the working directory
WORKDIR /app

# Copy only necessary files for production
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port your Node app listens on

EXPOSE 3000

# Command to start the app
CMD ["node", "dist/server.js"] 