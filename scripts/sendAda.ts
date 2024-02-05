import { AppWallet, Transaction } from "@meshsdk/core";
import { initAppWallet, wallets } from "../core/wallet";
import { TIME_TO_EXPIRE } from "../core/config";
import { fromLovelace, toLovelace } from "../core/utils/converter";
import { fuixlabsProvider } from "../core/fetch";

const senderMnemonic: string = process.env?.SENDER_ADA as string;
const senderWallet: AppWallet = initAppWallet(senderMnemonic);
console.log(senderWallet.getPaymentAddress());

const tx: Transaction = new Transaction({ initiator: senderWallet });

const numWallets = wallets.length;
for (let i = 0; i < numWallets; ++i) {
  const wallet = wallets[i];
  console.log("Sending ADA to: ", wallet.getPaymentAddress());
  const balance = await fuixlabsProvider.getLovelace(
    wallet.getPaymentAddress()
  );
  console.log("Balance: ", fromLovelace(balance));
  if (fromLovelace(balance) < 10n) {
    for (let it = 0; it < 20; ++it) {
      tx.sendLovelace(wallet.getPaymentAddress(), toLovelace(1.5)?.toString());
    }
  }
}

tx.setTimeToExpire(TIME_TO_EXPIRE);

const unsignedTx: string = await tx.build();
const signedTx: string = await senderWallet.signTx(unsignedTx);
const txHash: string = await senderWallet.submitTx(signedTx);

console.log(txHash);
