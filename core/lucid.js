import * as dotenv from "dotenv";
dotenv.config();

import { Lucid, Blockfrost } from "lucid-cardano";

import * as A from "./account";

const lucid = await Lucid.new(
  new Blockfrost(
    process.env.CARDANO_NETWORK == 0 ? "https://cardano-testnet.blockfrost.io/api/v0" : "https://cardano-mainnet.blockfrost.io/api/v0",
    process.env.BLOCKFROST_APIKEY,
  ),
  process.env.CARDANO_NETWORK == 0 ? "Testnet" : "Mainnet",
);

lucid.selectWalletFromPrivateKey(A.getCurrentAccount().paymentKey.to_bech32());

console.info(lucid);

console.info(await lucid.wallet.getUtxos());

console.info(await lucid.wallet.address());

export { lucid };