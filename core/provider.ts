import {
  AppWallet,
  Transaction,
  ForgeScript,
  MaestroProvider,
  BlockfrostProvider,
  resolveTxHash,
  resolvePaymentKeyHash,
  resolveSlotNo,
  parseAssetUnit,
  keepRelevant,
} from "@meshsdk/core";

const maestroProvider = new MaestroProvider({
  network: "Preprod", apiKey: "jiJEVf0LfHXqmXRhh6kR8gFVXWGIPHk4", turboSubmit: false
});

const blockfrostProvider = new BlockfrostProvider("preprodeMB9jfka6qXsluxEhPLhKczRdaC5QKab");

export const blockchainProvider = blockfrostProvider;