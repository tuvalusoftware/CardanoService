import * as L from "./core/lucid";

async function main() {
  const address = await L.lucid.wallet.address();

  console.log(address);

  // const UTXOs = await L.lucid.wallet.getUtxos();
  // console.log(UTXOs);

  let tx = L.lucid.newTx();

  for (let i = 0; i < 15; i++) {
    tx = tx.payToAddress(address, {
      lovelace: 1_000_000,
    })
  }

  tx = await tx.complete();

  const signedTx = await tx.sign().complete();

  let txHash = null;
  try {
    txHash = await signedTx.submit();
    await L.lucid.awaitTx(txHash);
    console.log("Transaction submitted successfully", txHash);
  } catch (error) {
    console.error(error);
  }
}

main();

// import keccak256 from "keccak256";
// import { MintNFTRandom } from "./core/transaction";
// import { delay, getAssetDetails } from "./core/helpers";

// async function main(i) {
//   // try {
//   //   MintNFTRandom({
//   //     assetName: keccak256(i.toString()).toString("hex"), metadata: {}, options: {}
//   //   }).then(a => {
//   //     console.log(a);
//   //   })
//   // } catch (error) {
//   // }
//   try {
//     await getAssetDetails("07855ac45ff148105e53fd08451dbeced6e2a97da9463435d639c6f66d7ada51e750000f3b50ac8bc99b91917894bfdf92f1c1739c206b40d93c27ce");
//   } catch (error) {
//     console.log(error);
//   }
// }

// main(0);

// async function runMain() {
//   for (let i = 50; i < 51; i++) {
//     console.log("Running", i);
//     main(i);
//   }
// }

// runMain();