import { AppWallet, Transaction } from "@meshsdk/core";
import { initAppWallet, wallets } from "../core/wallet";
import { TIME_TO_EXPIRE } from "../core/config";
import { fromLovelace, toLovelace } from "../core/utils/converter";
import { fuixlabsProvider } from "../core/fetch";
import { ILogObj, Logger } from "tslog";
import { appendFileSync } from "fs";

export async function sendAda() {
  const senderMnemonic: string = process.env?.SENDER_ADA as string;
  const senderWallet: AppWallet = initAppWallet(senderMnemonic);

  const log: Logger<ILogObj> = new Logger();

  log.attachTransport((logObj) => {
    appendFileSync("sendAda.log", JSON.stringify(logObj) + "\n");
  });

  log.info("Sender address: " + senderWallet.getPaymentAddress());

  const senderBalance = await fuixlabsProvider.getLovelace(
    senderWallet.getPaymentAddress()
  );
  log.info(
    "Sender balance: " + fromLovelace(senderBalance).toString() + " ADA"
  );

  if (fromLovelace(senderBalance) < 100n) {
    log.error("Sender wallet is running out of ADA");
  } else {
    const tx: Transaction = new Transaction({ initiator: senderWallet });

    const numWallets = wallets.length;
    for (let i = 0; i < numWallets; ++i) {
      const wallet = wallets[i];
      log.info("Sending ADA to: " + wallet.getPaymentAddress());
      const balance = await fuixlabsProvider.getLovelace(
        wallet.getPaymentAddress()
      );
      log.info("Balance: " + fromLovelace(balance).toString() + " ADA");
      if (fromLovelace(balance) < 100n) {
        for (let it = 0; it < 10; ++it) {
          tx.sendLovelace(
            wallet.getPaymentAddress(),
            toLovelace(10)?.toString()
          );
        }
      }
    }

    tx.setTimeToExpire(TIME_TO_EXPIRE);

    const unsignedTx: string = await tx.build();
    const signedTx: string = await senderWallet.signTx(unsignedTx);
    const txHash: string = await senderWallet.submitTx(signedTx);

    log.info("Tx hash: " + txHash);
  }
}
