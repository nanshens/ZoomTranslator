FROM node:20-slim

COPY . /root/app

RUN cd /root/app

WORKDIR /root/app

RUN npm cache clean --force

RUN rm -rf node_modules

RUN npm install

EXPOSE 4000
CMD [ "npm","start" ]