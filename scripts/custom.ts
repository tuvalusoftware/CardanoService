import { AppWallet, BlockfrostProvider, ForgeScript, Mint, NativeScript, Transaction, resolvePaymentKeyHash, resolveSlotNo } from "@meshsdk/core";
import { TIME_TO_EXPIRE } from "../core/config";
import { delay } from "../core/utils";

const holderAddress: string = "addr1q9s7eaxg56h9kl3aw64yqfyvq3jp77plgsze4w97h0y7hxj4hppqshxzednjs4cflxv9jpuz73q00lxsygcyekdwhlqq45aram";

// const holderAddress: string = "addr1q99nyv96tvf0llvjaht6afztd04meh6haal7ycnkpgmj9mh96a3xxvphdgl2ga829f9aaax7lfq5hn92d52aevy0knfqdfyfk9";

const prefixAssetName: string = "DigitalTransformationJobsCTU";
const ipfsImage: string = "ipfs://QmXGMagShnRA8astQQYvwfsJwxteqEbXxZ7KByHLNvxfB7";

const jsonMetadata: any = (no: number) => {
  return {
    name: `${prefixAssetName} #${no}`,
    files: [
      {
        src: ipfsImage,
        name: `${prefixAssetName} #${no}`,
        mediaType: "image/jpeg",
      }
    ],
    image: ipfsImage,
    mediaType: "image/jpeg",
    website: "https://fuixlabs.com"
  };
};

const blockchainProvider: BlockfrostProvider = new BlockfrostProvider("mainnetTMQM1bL457rJf11VlDBExuYOqyCHBAcA");

export const mint: AppWallet = new AppWallet({
  networkId: 1, // 0 for testnet, 1 for mainnet
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: "mnemonic",
    words: "".split(" "),
  },
});

const generateNativeScript = async (keyHash: string): Promise<NativeScript> => {
  let oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + Math.floor(Math.random() * 1000) + 1);

  await delay(5);
  const ttl = resolveSlotNo("mainnet", oneYearFromNow.getTime());

  const nativeScript: NativeScript = {
    type: "all",
    scripts: [
      {
        type: "before",
        slot: ttl,
      },
      {
        type: "sig",
        keyHash: keyHash,
      },
    ],
  };

  return nativeScript;
}

// const mintAddress: string = mint.getPaymentAddress();
// const keyHash: string = resolvePaymentKeyHash(mintAddress);

// const nativeScript = await generateNativeScript(keyHash);
// const forgeScript = ForgeScript.fromNativeScript(nativeScript);
// console.log(forgeScript);

// const forgeScript: ForgeScript = "82018282051b000000033c587f978200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee";

const forgeScript: ForgeScript = "82018282051b000000036d457f3e8200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee";

const tx: Transaction = new Transaction({ initiator: mint });

for (let i = 29; i <= 55; ++i) {
  const assetMetadata: any = jsonMetadata(i);

  const info: Mint = {
    assetName: `${prefixAssetName}${i.toString().padStart(3, "0")}`,
    assetQuantity: "1",
    metadata: assetMetadata,
    label: "721",
    recipient: holderAddress,
  };

  tx.mintAsset(forgeScript, info);
}

tx.setTimeToExpire(TIME_TO_EXPIRE);

const unsignedTx: string = await tx.build();
const signedTx: string = await mint.signTx(unsignedTx);
const txHash: string = await mint.submitTx(signedTx);
console.log(txHash);