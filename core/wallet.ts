import { AppWallet } from "@meshsdk/core";
import { blockchainProvider } from "./provider";
import { BASE_PORT, BURNER_MNEMONIC, HOLDER_MNEMONIC, MNEMONIC_FILE, NETWORK_ID, PORT } from "./config";
import { BunFile } from "bun";

const F: BunFile = Bun.file(MNEMONIC_FILE);
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
export const wallet: AppWallet = wallets[Number(PORT % BASE_PORT % wallets.length)];

export const holder: AppWallet = new AppWallet({
  networkId: NETWORK_ID,
  fetcher: blockchainProvider,
  submitter: null,
  key: {
    type: "mnemonic",
    words: HOLDER_MNEMONIC.split(" "),
  },
});

export const burner: AppWallet = new AppWallet({
  networkId: NETWORK_ID,
  fetcher: blockchainProvider,
  submitter: null,
  key: {
    type: "mnemonic",
    words: BURNER_MNEMONIC.split(" "),
  },
});

export const burnerAddress: string = burner.getPaymentAddress();
export const holderAddress: string = holder.getPaymentAddress();
export const walletAddress: string = wallet.getPaymentAddress();