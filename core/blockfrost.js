import * as dotenv from "dotenv";
dotenv.config();

const SERVER = [
	"https://cardano-testnet.blockfrost.io/api/v0",
	"https://cardano-mainnet.blockfrost.io/api/v0",
	"https://cardano-preprod.blockfrost.io/api/v0",
	"https://cardano-preview.blockfrost.io/api/v0"
];

const NETWORK = [
	"testnet",
	"mainnet",
	"preprod",
	"preview"
];

const API_KEY = [
	process.env.TESTNET_BLOCKFROST_APIKEY || "",
	process.env.MAINNET_BLOCKFROST_APIKEY || "",
	process.env.PREPROD_BLOCKFROST_APIKEY || "",
	process.env.PREVIEW_BLOCKFROST_APIKEY || ""
];

const NETWORK_ID = process.env.CARDANO_NETWORK;

const BlockfrostConfig = {
	networkId: NETWORK_ID,
	network: NETWORK[NETWORK_ID],
	apiKey: API_KEY[NETWORK_ID],
	serverUrl: SERVER[NETWORK_ID],
};

const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || "";

export { BlockfrostConfig, capitalize };