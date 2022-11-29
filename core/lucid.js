import * as dotenv from "dotenv";
dotenv.config();

import * as A from "./account";

import { Lucid, Blockfrost } from "lucid-cardano";
import { BlockfrostConfig, capitalize } from "./blockfrost";
import logger from "../Logger";

const lucid = await Lucid.new(
  new Blockfrost(
    BlockfrostConfig.serverUrl,
    BlockfrostConfig.apiKey,
  ),
  capitalize(BlockfrostConfig.network),
);

lucid.selectWalletFromPrivateKey(A.getCurrentAccount().paymentKey.to_bech32());

logger.info(lucid.provider);
logger.info("Network:", lucid.network);

try {
  logger.info(await lucid.wallet.address());
} catch (error) {
  logger.error(error);
}

export { lucid };