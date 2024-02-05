import {
  MaestroProvider,
  BlockfrostProvider,
  MaestroSupportedNetworks,
} from "@meshsdk/core";
import { NETWORK_NAME, MAESTRO_API_KEY, BLOCKFORST_API_KEY } from "./config";
import { parseCapitalize } from "./utils/parse";

const maestroProvider: MaestroProvider = new MaestroProvider({
  network: parseCapitalize(NETWORK_NAME) as MaestroSupportedNetworks,
  apiKey: MAESTRO_API_KEY,
  turboSubmit: true,
});

const blockfrostProvider: BlockfrostProvider = new BlockfrostProvider(
  BLOCKFORST_API_KEY
);

export const blockchainProvider: BlockfrostProvider | MaestroProvider =
  maestroProvider;
