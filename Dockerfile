FROM node:14.13.1
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
EXPOSE 30922
CMD [ "node", "server.js" ]
