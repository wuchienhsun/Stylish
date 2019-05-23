FROM node:10.14.2
WORKDIR /app
ADD . /app
COPY package.json /app
RUN npm install
EXPOSE 443
CMD [ "npm", "start" ]
