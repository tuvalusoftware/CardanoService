import * as dotenv from "dotenv";
dotenv.config();

const server = [
  "https://cardano-testnet.blockfrost.io/api/v0",
  "https://cardano-mainnet.blockfrost.io/api/v0",
  "https://cardano-preprod.blockfrost.io/api/v0",
  "https://cardano-preview.blockfrost.io/api/v0"
];

const network = [
  "testnet",
  "mainnet",
  "preprod",
  "preview"
];

const apikey = [
  process.env.TESTNET_BLOCKFROST_APIKEY || "",
  process.env.MAINNET_BLOCKFROST_APIKEY || "",
  process.env.PREPROD_BLOCKFROST_APIKEY || "",
  process.env.PREVIEW_BLOCKFROST_APIKEY || ""
];

const networkId = process.env.CARDANO_NETWORK;

const BlockfrostConfig = {
  networkId: networkId,
  network: network[networkId],
  apiKey: apikey[networkId],
  serverUrl: server[networkId],
};

const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || "";

export { BlockfrostConfig, capitalize };