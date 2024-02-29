import { getVersion } from "../core";

const ver = await getVersion({
  unit: "5276743ffa5ee4e6d5303504c5ce0cbaad067a998960701892f1df4c74657374313030",
});

console.log(ver);

import {
  AppWallet,
  BlockfrostProvider,
  Transaction,
} from "@meshsdk/core";
import { TIME_TO_EXPIRE } from "../core/config";
import { toLovelace } from "../core/utils/converter";

const blockchainProvider: BlockfrostProvider = new BlockfrostProvider(
  "mainnetctIGHjMid1LKs68mLhQ296KQOhqr3h8k"
);
console.log(await blockchainProvider.fetchBlockInfo("latest"));

export const mint: AppWallet = new AppWallet({
  networkId: 1, // 0 for testnet, 1 for mainnet
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: "mnemonic",
    words: "".split(" "),
  },
});

const tx: Transaction = new Transaction({ initiator: mint })
  .sendLovelace("", toLovelace(1).toString());

const unsignedTx: string = await tx.build();
const signedTx: string = await mint.signTx(unsignedTx);
const txHash: string = await mint.submitTx(signedTx);
console.log(txHash);
