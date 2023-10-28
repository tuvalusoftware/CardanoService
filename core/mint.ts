import {
  Transaction,
  ForgeScript,
  resolvePaymentKeyHash,
  resolveSlotNo,
} from "@meshsdk/core";

import type { Mint, AssetMetadata, Asset, NativeScript } from "@meshsdk/core";
import { Logger, ILogObj } from "tslog";
import { toAsset } from "./utils/converter";
import { BurnParams, BurnResult, MintParams, MintResult, Options } from "./type";
import { blockchainProvider } from "./provider";
import { holder, holderAddress, wallet, walletAddress, wallets } from "./wallet";
import { MAX_NFT_PER_TX, TEN_MINUTES, TIME_TO_EXPIRE } from "./config";
import { ERROR } from "./error";
import { assertEqual, waitForTransaction } from "./utils";
import { getSender } from ".";
import { TaskQueue } from "./config/rabbit";

const log: Logger<ILogObj> = new Logger();

log.info("Wallet address:", walletAddress);
log.info("Holder address:", holderAddress);

const generateNativeScript = async (keyHash: string): Promise<NativeScript> => {
  let oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + Math.floor(Math.random() * 1000) + 1);

  await Bun.sleep(5);
  const ttl = resolveSlotNo("preprod", oneYearFromNow.getTime());

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

export const mint = async ({ assets, options }: { assets: MintParams[], options?: Options }): Promise<MintResult> => {
  {
    console.log(assets.length);
    assertEqual(assets.length <= MAX_NFT_PER_TX, true, ERROR.TOO_MANY_ASSETS);
  }

  log.debug("💰 Minting assets");

  const result: MintResult = {
    txHash: "",
    assets: {},
  };

  const keyHash = resolvePaymentKeyHash(walletAddress);
  const tx = new Transaction({ initiator: wallet });

  for (const asset of assets) {
    const nativeScript = await generateNativeScript(keyHash);
    const forgingScript: ForgeScript = asset?.forgingScript ?? ForgeScript.fromNativeScript(nativeScript);
    console.log("forgingScript", forgingScript);
    const assetMetadata: AssetMetadata = asset?.metadata ?? {};

    const info: Mint = {
      assetName: asset?.assetName,
      assetQuantity: "1",
      metadata: assetMetadata!,
      label: "721",
      recipient: holderAddress,
    };

    tx.mintAsset(forgingScript!, info);

    const { unit, policyId } = toAsset(forgingScript as string, info);
    result.assets[asset?.assetName] = {
      unit,
      forgingScript,
      policyId,
      assetName: asset?.assetName,
    };
  }

  tx.setTimeToExpire(TIME_TO_EXPIRE);

  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  log.info("🐳 Transaction submitted", txHash);

  for (const asset of assets) {
    const { sender, queue } = getSender({ service: TaskQueue });
    const buff: Buffer = Buffer.from(JSON.stringify(result.assets[asset?.assetName]));
    sender.sendToQueue(queue, buff, {
      expiration: TEN_MINUTES,
      persistent: true,
    });
  }

  result.txHash = txHash;
  return result;
};

export const burn = async ({ assets, options }: { assets: BurnParams[], options?: Options }): Promise<BurnResult> => {
  {
    assertEqual(assets.length <= MAX_NFT_PER_TX, true, ERROR.TOO_MANY_ASSETS);
  }

  log.debug("🔥 Burning assets");

  const result: BurnResult = {
    txHash: ""
  };

  const tx = new Transaction({ initiator: holder });

  for (const asset of assets) {
    if (asset?.removeCollection) {
      const collection: { assets: Asset[] } & {} = await blockchainProvider.fetchCollectionAssets(asset?.policyId!);
      console.log("collection", collection);
      for (const a of collection?.assets) {
        tx.burnAsset(asset?.forgingScript!, a);
      }
    }
    const info: Asset = {
      unit: asset?.unit,
      quantity: "1",
    };
    tx.burnAsset(asset?.forgingScript!, info);
  }

  tx.setTimeToExpire(TIME_TO_EXPIRE);

  const requiredSigners: string[] = [holderAddress];
  for (const w of wallets) {
    requiredSigners.push(w.getPaymentAddress());
  }
  tx.setRequiredSigners(requiredSigners);

  const unsignedTx = await tx.build();
  let signedTx = await holder.signTx(unsignedTx, true);
  for (const w of wallets) {
    signedTx = await w.signTx(signedTx, true);
  }

  const txHash = await wallet.submitTx(signedTx);
  log.info("🐳 Transaction submitted", txHash);

  result.txHash = txHash;
  return result;
};