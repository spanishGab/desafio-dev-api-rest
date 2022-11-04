FROM node:16

ENV DATABASE_URL=file:../database/accounts.db

RUN mkdir -p /accounts-api

COPY . /accounts-api/

WORKDIR /accounts-api

RUN npm install --save && npm run build

RUN npx prisma migrate dev --name init

EXPOSE 5000

ENTRYPOINT ["npm", "run", "start"]
