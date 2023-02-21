**Make sure you are on the correct path.** 

# Guide

Step 1. Go to root directory, then run:

```
  npm i
```

Step 2. Create .env file in root and copy-paste:

```
  TESTNET_BLOCKFROST_APIKEY="" # CARDANO_NETWORK=0
  MAINNET_BLOCKFROST_APIKEY="" # CARDANO_NETWORK=1
  PREPROD_BLOCKFROST_APIKEY="" # CARDANO_NETWORK=2
  PREVIEW_BLOCKFROST_APIKEY="" # CARDANO_NETWORK=3

  CARDANO_NETWORK=2
  
  AUTH_SERVER=https://auth-fuixlabs.ap.ngrok.io

  CORS_DOMAINS="https://paperless-fuixlabs.ap.ngrok.io,https://resolver-fuixlabs.ap.ngrok.io"

  MNEMONIC=#

  CRYPTO_SECRET_PASSWORD="#"
  CRYPTO_SECRET_PASSWORD_HASH="#"
  CRYPTO_SECRET_PASSWORD_IV="#"

  ENVIRONMENT="prod" # develop

  DEVELOP_MNEMONIC="#"
```
`CARDANO_NETWORK` is `0/2/3` for Cardano Testnet/Preprod/Preview, otherwise, `1` for Cardano Mainnet.

If you want to get `MNEMONIC` and `DEVELOP_MNEMONIC`, go to `https://iancoleman.io/bip39/` and choose `12` words to generate.

**While the first runs, you will know your address on the console. To obtain 1000 ADA, go to Faucet.**

Step 3. Go to `https://<localhost>/api-docs/` to read a document.

# Docker

Run `docker-compose up` in cmd in root directory.

** Make sure you are on the right path and the `.env` file has all the attributes described above. **