import {
  MaestroProvider,
  BlockfrostProvider,
  MaestroSupportedNetworks,
} from "@meshsdk/core";
import { NETWORK_NAME } from "./config";
import { parseCapitalize } from "./utils/parse";

const maestroProvider: MaestroProvider = new MaestroProvider({
  network: parseCapitalize(NETWORK_NAME) as MaestroSupportedNetworks,
  apiKey: "jiJEVf0LfHXqmXRhh6kR8gFVXWGIPHk4",
  turboSubmit: true
});

const blockfrostProvider: BlockfrostProvider = new BlockfrostProvider("preprodeMB9jfka6qXsluxEhPLhKczRdaC5QKab");

export const blockchainProvider: BlockfrostProvider | MaestroProvider = maestroProvider;