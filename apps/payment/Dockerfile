FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

CMD [ "npm", "run", "start:dev", "payment" ]