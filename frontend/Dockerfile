# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install
RUN npm install @mui/material @emotion/react @emotion/styled

# Install component libraries and icons
RUN npm install @ant-design/icons lucide-react framer-motion

# Install form handling and validation
RUN npm install formik yup

# Install PDF and canvas utilities
RUN npm install html2canvas jspdf
# Copy remaining source code
COPY . .

# Expose development port
EXPOSE 5173

# Add host flag to dev command to make it accessible outside container
CMD ["npm", "run", "dev", "--", "--host"]