declare var self: Worker;
import { holder, wallet, wallets } from "./wallet";

const signTxWorker = async (signedTx: string, walletId: number) => {
  signedTx = await wallets[walletId]?.signTx(signedTx, true);
  self.postMessage({ signedTx: signedTx });
};

self.addEventListener("message", (event) => {
  const { signedTx, walletId } = event.data;
  signTxWorker(signedTx, walletId);
});
