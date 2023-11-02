import {
  MaestroProvider,
  BlockfrostProvider,
} from "@meshsdk/core";

const maestroProvider: MaestroProvider = new MaestroProvider({
  network: "Preprod", apiKey: "jiJEVf0LfHXqmXRhh6kR8gFVXWGIPHk4", turboSubmit: false
});

const blockfrostProvider: BlockfrostProvider = new BlockfrostProvider("preprodeMB9jfka6qXsluxEhPLhKczRdaC5QKab");

export const blockchainProvider: BlockfrostProvider | MaestroProvider = maestroProvider;