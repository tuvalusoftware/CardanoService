import * as dotenv from "dotenv";
dotenv.config();

import * as A from "./account";

import { Lucid, Blockfrost } from "lucid-cardano";
import { BlockfrostConfig, capitalize } from "./blockfrost";
import logger from "../Logger";

let lucid = await Lucid.new(
	new Blockfrost(
		BlockfrostConfig.serverUrl,
		BlockfrostConfig.apiKey,
	),
	capitalize(BlockfrostConfig.network),
);

if (!process.env.DEVELOP_MNEMONIC && process.env.ENVIRONMENT == "develop") {
	process.exit(1);
}

if (!process.env.MNEMONIC && process.env.ENVIRONMENT == "prod") {
	process.exit(1);
}

logger.info("Loading wallet 4");
A.getCurrentAccount(process.env.MNEMONIC4);

logger.info("Loading wallet 0");
A.getCurrentAccount(process.env.MNEMONIC);

logger.info("Loading wallet 1");
A.getCurrentAccount(process.env.MNEMONIC2);

logger.info("Loading wallet 2");
A.getCurrentAccount(process.env.MNEMONIC3);

lucid.selectWalletFromPrivateKey(A.getCurrentAccount(
	process.env.ENVIRONMENT === "develop" ? process.env.DEVELOP_MNEMONIC : process.env.MNEMONIC4
).paymentKey.to_bech32());

export { lucid };