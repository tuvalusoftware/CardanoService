import { AppWallet, Transaction } from "@meshsdk/core";
import { initAppWallet, wallets } from "../core/wallet";
import { TIME_TO_EXPIRE } from "../core/config";
import { toLovelace } from "../core/utils/converter";

const senderMnemonic: string = process.env?.SENDER_ADA as string;
const senderWallet: AppWallet = initAppWallet(senderMnemonic);

const tx: Transaction = new Transaction({ initiator: senderWallet });

for (const wallet of wallets) {
  for (let it = 0; it < 1; ++it) {
    tx.sendLovelace(wallet.getPaymentAddress(), toLovelace(20)?.toString());
  }
  for (let it = 0; it < 5; ++it) {
    tx.sendLovelace(wallet.getPaymentAddress(), toLovelace(1.5)?.toString());
  }
}

tx.setTimeToExpire(TIME_TO_EXPIRE);

const unsignedTx: string = await tx.build();
const signedTx: string = await senderWallet.signTx(unsignedTx);
const txHash: string = await senderWallet.submitTx(signedTx);

console.log(txHash);