import * as dotenv from "dotenv";
dotenv.config();

import * as A from "./account";

import { Lucid, Blockfrost, Maestro } from "lucid-cardano";
import { BlockfrostConfig, MaestroConfig, capitalize } from "./blockfrost";
import logger from "../Logger";

let lucid = await Lucid.new(
	// new Blockfrost(
	// 	BlockfrostConfig.serverUrl,
	// 	BlockfrostConfig.apiKey,
	// ),
	new Maestro({
		network: capitalize(BlockfrostConfig.network),
		apiKey: MaestroConfig.apiKey,
		turboSubmit: true,
	}),
	capitalize(BlockfrostConfig.network),
);

if (!process.env.DEVELOP_MNEMONIC && process.env.ENVIRONMENT == "develop") {
	process.exit(1);
}

if (!process.env.PROD_MNEMONIC && process.env.ENVIRONMENT == "prod") {
	process.exit(1);
}

lucid.selectWalletFromPrivateKey(A.getCurrentAccount(
	process.env.ENVIRONMENT === "develop" ? process.env.DEVELOP_MNEMONIC : process.env.PROD_MNEMONIC
).paymentKey.to_bech32());

export { lucid };