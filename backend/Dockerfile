# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies including development dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app runs on (default: 5000)
EXPOSE 5000

# Define the command to run your application
CMD ["npm", "start"]