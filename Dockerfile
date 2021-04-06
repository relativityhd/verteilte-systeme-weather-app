# Import NodeJS Docker Base Image
FROM node:14.13.1
# Set NODE_ENV to production
ENV NODE_ENV=production
# Set a specific workdir -> Cleaner installation
WORKDIR /app
# Install dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
# Expose the port 30922
EXPOSE 30922
# Set the start command of the image
CMD [ "node", "src/server.js" ]
