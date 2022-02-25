FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY runner /bin/runner
RUN chmod +x /bin/runner
COPY app.js app.js

EXPOSE 8080
CMD [ "/bin/runner" ]


