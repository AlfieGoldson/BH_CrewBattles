FROM node

WORKDIR /usr/src/server

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn

COPY . .

CMD ["yarn", "dev"]