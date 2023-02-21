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

if (!process.env.DEVELOP_MNEMONIC && process.env.ENVIRONMENT == "develop") {
	process.exit(1);
}

if (!process.env.MNEMONIC && process.env.ENVIRONMENT == "prod") {
	process.exit(1);
}

lucid.selectWalletFromPrivateKey(A.getCurrentAccount(
	process.env.ENVIRONMENT === "develop" ? process.env.DEVELOP_MNEMONIC : process.env.MNEMONIC
).paymentKey.to_bech32());

export { lucid };