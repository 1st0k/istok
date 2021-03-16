FROM node:14

RUN apt-get update && \
    apt-get install -y default-jre && \
    apt-get clean;

RUN npm install -g firebase-tools