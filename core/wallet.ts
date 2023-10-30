import { AppWallet } from "@meshsdk/core";
import { blockchainProvider } from "./provider";
import { BASE_PORT, NETWORK_ID, PORT } from "./config";
import { BunFile } from "bun";

const F: BunFile = Bun.file(`${process.cwd()}/core/config/mnemonics.json`);
const M: any = await F.json();

export const initAppWallet = (mnemonic: string) => {
  return new AppWallet({
    networkId: NETWORK_ID,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
      type: "mnemonic",
      words: mnemonic.split(" "),
    },
  });
};

const mnemonics: string[] = M?.mnemonics || [];

export const wallets: AppWallet[] = mnemonics.map(initAppWallet);
export const wallet: AppWallet = wallets[PORT % BASE_PORT % wallets.length];

export const holder: AppWallet = new AppWallet({
  networkId: NETWORK_ID,
  fetcher: blockchainProvider,
  submitter: null,
  key: {
    type: "mnemonic",
    words: "swear coil wheat wash glimpse ice warm kangaroo team green veteran science edge fresh vast".split(" "),
  },
});

export const holderAddress: string = holder.getPaymentAddress();
export const walletAddress: string = wallet.getPaymentAddress();