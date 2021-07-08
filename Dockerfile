FROM node:12

RUN npm install -g ts-node

RUN mkdir /usr/src/cache

WORKDIR /usr/src/cache

COPY package*.json ./

RUN npm install

WORKDIR /usr/src/app/back

RUN mkdir ./node_modules

EXPOSE 3000
