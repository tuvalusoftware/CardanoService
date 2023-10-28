import { AppWallet, BlockfrostProvider, ForgeScript, NativeScript, Transaction, resolvePaymentKeyHash, resolveSlotNo } from "@meshsdk/core";
import { TIME_TO_EXPIRE } from "../core/config";

// const holderAddress: string = "addr1q9s7eaxg56h9kl3aw64yqfyvq3jp77plgsze4w97h0y7hxj4hppqshxzednjs4cflxv9jpuz73q00lxsygcyekdwhlqq45aram";

const holderAddress: string = "addr1qxdzx4u4c276eh42jvcdaqmqr8h7xtlt06xspmtnyn07g3x0zcqe86v8je93vzqkdcnj2800dtp0tqa37xr9d3elzjfset3lgd";

const prefixAssetName: string = "DigitalTransformationandJobopportunities";
const ipfsImage: string = "ipfs://QmaV7x1jpinT4wE3zEEiFRYTi45xX9fWSSq6phEwqnhwgZ";

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

const blockchainProvider = new BlockfrostProvider("mainnetUxZ1oGgRnSRbrsR0DUuyNY2hCL5tGqBy");

export const mint = new AppWallet({
  networkId: 1, // 0 for testnet, 1 for mainnet
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: "mnemonic",
    words: "panel bubble denial portion rely tumble visual tube country immense clock install".split(" "),
  },
});

const generateNativeScript = async (keyHash: string): Promise<NativeScript> => {
  let oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + Math.floor(Math.random() * 1000) + 1);

  await Bun.sleep(5);
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

const mintAddress = mint.getPaymentAddress();
const keyHash = resolvePaymentKeyHash(mintAddress);

// const nativeScript = await generateNativeScript(keyHash);
// const forgeScript = ForgeScript.fromNativeScript(nativeScript);
// console.log(forgeScript);

const forgeScript: ForgeScript = "82018282051b000000033c587f978200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee";

const tx = new Transaction({ initiator: mint });

for (let i = 0; i < 1; ++i) {
  const assetMetadata: any = jsonMetadata(i);

  const info = {
    assetName: `${prefixAssetName}${i.toString().padStart(3, "0")}`,
    assetQuantity: "1",
    metadata: assetMetadata,
    label: "721",
    recipient: holderAddress,
  };

  tx.mintAsset(forgeScript, info);
}

tx.setTimeToExpire(TIME_TO_EXPIRE);

const unsignedTx = await tx.build();
const signedTx = await mint.signTx(unsignedTx);