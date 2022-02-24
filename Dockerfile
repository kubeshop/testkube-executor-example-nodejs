FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY app.js app.js

EXPOSE 8080
CMD [ "node", "app.js" ]


