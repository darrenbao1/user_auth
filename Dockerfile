# Use Node.js official image
FROM node:20-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Start your app
CMD ["npm", "run", "dev"]   # or "start" for production
