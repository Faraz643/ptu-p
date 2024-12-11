FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 5173
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]