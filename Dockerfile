FROM node:18
ENV NODE_ENV="production"
# ENV BLOCKFROST_APIKEY="testnetJe6W7FM1Jwkh0PxNMZt9OzNND3T1mS1T"
# ENV MNEMONIC="nephew flash obey meat magic vibrant friend upgrade artefact olive equal bacon"
# ENV AUTH_SERVER="http://192.168.2.2:12000"
# ENV CARDANO_NETWORK=0
# ENV BLOCKFROST_APIKEY=${BLOCKFROST_APIKEY}
# ENV MNEMONIC=${MNEMONIC}
# ENV AUTH_SERVER=${AUTH_SERVER}
# ENV CARDANO_NETWORK=${CARDANO_NETWORK}
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 10003
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]