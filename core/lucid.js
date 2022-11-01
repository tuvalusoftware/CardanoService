import * as dotenv from "dotenv";
dotenv.config();

import { Lucid, Blockfrost } from "lucid-cardano";

import * as A from "./account";

import Logger from "../Logger";

import { BlockfrostConfig, capitalize } from "./blockfrost";

const lucid = await Lucid.new(
  new Blockfrost(
    BlockfrostConfig.serverUrl,
    BlockfrostConfig.apiKey,
  ),
  capitalize(BlockfrostConfig.network),
);

lucid.selectWalletFromPrivateKey(A.getCurrentAccount().paymentKey.to_bech32());

Logger.info(lucid.provider);
Logger.info("Network:", lucid.network);

try {
  Logger.info(await lucid.wallet.address());
} catch (error) {
  Logger.error(error);
}

export { lucid };