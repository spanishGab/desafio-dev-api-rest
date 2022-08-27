FROM node:16

RUN mkdir -p /accounts-api

WORKDIR /accounts-api

COPY . /accounts-api/

RUN npm install --save && npm run build

ENTRYPOINT npm run start
