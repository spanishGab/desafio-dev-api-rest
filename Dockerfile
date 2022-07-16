FROM node:16

RUN mkdir -p /payments-api

WORKDIR /payments-api

COPY . /payments-api/

RUN npm install --save && npm run build

ENTRYPOINT npm run start
