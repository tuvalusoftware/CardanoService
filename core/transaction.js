import * as L from "./lucid";
import * as W from "./wallet";

import { errorTypes } from "./error.types";

export const MintNFT = async ({ assetName, metadata, options }) => {
  let policy = W.createLockingPolicyScript();
  policy.script = Buffer.from(policy.script.to_bytes(), "hex").toString("hex");
  
  if (options.policy) {
    policy = options.policy;
  }

  metadata.timestamp = new Date().getTime();
  metadata.policy = policy.id;
  metadata.ttl = policy.ttl;

  const utxos = await L.lucid.wallet.getUtxos();
  const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;

  const address = await L.lucid.wallet.address();
  const assets = await L.lucid.utxosAtWithUnit(address, asset);
  if (assets.length > 0) {
    throw new Error(errorTypes.NFT_MINTED);
  }

  const tx = await L.lucid.newTx()
  .collectFrom(utxos)
  .attachMintingPolicy(policy)
  .attachMetadata(721, {
    [policy.id]: {
      [Buffer.from(assetName, "hex").toString("hex")]: metadata,
    },
  })
  .mintAssets({ [asset]: 1n  })
  .validTo(L.lucid.utils.slotToUnixTime(policy.ttl))
  .complete();
  const signedTx = await tx.sign().complete();
  try {
    await signedTx.submit();
  } catch (error) {
    console.log(error);
    throw new Error(errorTypes.TRANSACTION_REJECT);
  }

  return { policy, asset };
};

export const BurnNFT = async ({ config }) => {
  const utxos = await L.lucid.wallet.getUtxos();
  const address = await L.lucid.wallet.address();
  const assets = await L.lucid.utxosAtWithUnit(address, config.asset);
  
  if (assets.length > 0) {

    const tx = await L.lucid.newTx()
    .collectFrom(utxos)
    .attachMintingPolicy(config.policy)
    .mintAssets({
      [config.asset]: -1n
    })
    .validTo(L.lucid.utils.slotToUnixTime(config.policy.ttl))
    .complete();
    const signedTx = await tx.sign().complete();
    try {
      const txHash = await signedTx.submit();
      return txHash;
    } catch (error) {
      console.log(error);
      throw new Error(errorTypes.TRANSACTION_REJECT);
    }

  } else {
    throw new Error(errorTypes.NFT_COULD_NOT_BE_FOUND_IN_WALLET);
  }
};