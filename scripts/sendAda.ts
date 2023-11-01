import { AppWallet, Transaction } from "@meshsdk/core";
import { initAppWallet, wallets } from "../core/wallet";
import { TIME_TO_EXPIRE } from "../core/config";
import { toLovelace } from "../core/utils/converter";

const senderMnemonic: string = "";
const senderWallet: AppWallet = initAppWallet(senderMnemonic);

for (const wallet of [wallets[0]]) {
  const tx: Transaction = new Transaction({ initiator: wallet });
  
  console.log(wallet.getPaymentAddress());
  for (let it = 0; it < 0; ++it) {
    tx.sendLovelace(wallet.getPaymentAddress(), toLovelace(1.5)?.toString());
  }

  tx.setTimeToExpire(TIME_TO_EXPIRE);

  const unsignedTx: string = await tx.build();
  const signedTx: string = await wallet.signTx(unsignedTx);
  const txHash: string = await wallet.submitTx(signedTx);

  console.log(txHash);
}