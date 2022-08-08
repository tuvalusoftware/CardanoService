# Guide

Step 1. Go to root directory, then run:

```
  npm i
```

Step 2. Create .env file in root and copy-paste:

```
  BLOCKFROST_APIKEY=#

  CARDANO_NETWORK=0
  AUTH_SERVER=http://18.139.84.180:12000

  MNEMONIC=#
```
`CARDANO_NETWORK` is `0` for Cardano Testnet, otherwise, `1` for Cardano Mainnet.

If you want to get `MNEMONIC`, go to `https://iancoleman.io/bip39/` and choose `12` words to generate.

**While the first runs, you will know your address on the console. To obtain 1000ADA, go to Faucet.**

Step 3. Go to `https://<localhost>/api-docs/` to read a document.