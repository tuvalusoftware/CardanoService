FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 10000

CMD ["nodemon", "index.js"]