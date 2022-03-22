# Simple API for Cardano

## Requirement

NPM: v8.1.0
node: v16.13.0

## Configure app

Step 1. Create a `.env` file in root and set variable `shelleyGenesisPath` is path to `testnet-shelley-genesis.json`, see more details in `.env.example` file.

Step 2. Run code below in terminal to generate key-pair for JWT.

  ```bash
  npm run generate-key-pair-for-jwt
  ```

Step 3. In root, in `private` folder, create `secret.json` file:

```json
{
  "recovery-phrase": "<YOUR>-recovery-phrase",
  "passphrase": "<YOUR>-passphrase",
  "walletId": "<YOUR_WALLET_ID>"
}
```

Step 4. In `config/walletConfig.js`, you can modify to your config.

```js
...
module.exports = {
  recoveryPhrase: secret['recovery-phrase'], // cardano-wallet recovery phrase (see secret.json file)
  passphrase: secret.passphrase, // cardano-wallet passphrase (see secret.json file)
  serverURI: 'http://localhost:8090/v2', // cardano-wallet api server
  walletId: secret.walletId, // cardano-wallet id (see secret.json file)
  network: 'testnet-magic 1097911063', // mainnet or testnet-magic 1097911063
  FEE_FOR_ASSET: 1500000
  shelleyGenesisPath: process.env.shelleyGenesisPath, // path to `testnet-shelley-genesis.json` (see .env file)
  cardanoCliDir: path.join(__dirname, '../', 'cardano-cli-js-dir'),
  era: 'alonzo',
  NAME: 'ferdon-test', // cardano-cli wallet name
};
```

Step 5. Run code below in terminal to generate cardano-cli wallet from cardano-wallet

  ```bash
  npm run generate-cardano-cli-address
  ```

 ## Running the project

```bash
 node index.js
 ```

 or

 ```bash
 npm run start
 ```

 ## API Docs

 Running the project and go to `http://<localhost>/docs` to see a Swagger API docs.
