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
import { burnerAddress, holder, holderAddress, wallet, walletAddress, wallets } from "./wallet";
import { FIVE_SECONDS, MAX_NFT_PER_TX, NETWORK_NAME, TEN_MINUTES, TIME_TO_EXPIRE } from "./config";
import { ERROR } from "./error";
import { assertEqual, getOrDefault, waitForTransaction } from "./utils";
import { getCacheValue, getSender, setCacheValue } from ".";
import { ResolverService } from "./config/rabbit";
import { deleteCacheValue } from "./config/redis";

const log: Logger<ILogObj> = new Logger();

log.info("Wallet address:", walletAddress);
log.info("Holder address:", holderAddress);
log.info("Burner address:", burnerAddress);

const generateNativeScript = async ({ keyHash }: { keyHash: string }): Promise<NativeScript> => {
  let oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + Math.floor(Math.random() * 1000) + 1);

  await Bun.sleep(5);
  const ttl = resolveSlotNo(NETWORK_NAME, oneYearFromNow.getTime());

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
  assertEqual(assets.length <= MAX_NFT_PER_TX, true, ERROR.TOO_MANY_ASSETS);

  log.debug("💰 Minting assets");

  const result: MintResult = {
    txHash: "",
    assets: {},
  };

  const keyHash: string = resolvePaymentKeyHash(walletAddress);
  const tx: Transaction = new Transaction({ initiator: wallet });

  for (const asset of assets) {
    const nativeScript: NativeScript = await generateNativeScript({ keyHash });
    const forgingScript: ForgeScript = getOrDefault(asset?.forgingScript, ForgeScript.fromNativeScript(nativeScript));
    const assetMetadata: AssetMetadata = getOrDefault(asset?.metadata, {});

    const cached = await getCacheValue({
      key: `nft:config:${asset?.assetName!}`,
    });

    if (cached) {
      throw ERROR.ASSET_ALREADY_EXISTS;
    }

    const info: Mint = {
      assetName: asset?.assetName!,
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

  const requiredSigners: string[] = [holderAddress];
  for (const w of wallets) {
    requiredSigners.push(w.getPaymentAddress());
  }
  tx.setRequiredSigners(requiredSigners);

  const unsignedTx: string = await tx.build();
  let signedTx: string = await holder.signTx(unsignedTx, true);
  signedTx = await wallet.signTx(signedTx, true);

  for (const w of wallets) {
    signedTx = await w.signTx(signedTx, true);
  }

  const txHash: string = await wallet.submitTx(signedTx);
  log.info("🐳 Transaction submitted", txHash);

  for (const asset of assets) {
    const dat: any = {
      id: options?.id,
      type: options?.type,
      data: {
        ...result.assets[asset?.assetName!],
        txHash,
      },
    };

    await setCacheValue({
      key: asset?.assetName!,
      value: dat,
      expiredTime: -1,
    });

    if (options?.publish) {
      const { sender, queue } = getSender({ service: ResolverService });
      const buff: Buffer = Buffer.from(JSON.stringify(dat));
      sender.sendToQueue(queue, buff, {
        persistent: true,
        expiration: TEN_MINUTES,
      });
    }
  }

  if (!options?.skipWait) {
    await waitForTransaction(txHash);
  }

  if (options?.channel) {
    await Bun.sleep(FIVE_SECONDS);
    options!.channel!.ack(options!.msg);
  }

  result.txHash = txHash;
  return result;
};

export const burn = async ({ assets, options }: { assets: BurnParams[], options?: Options }): Promise<BurnResult> => {
  assertEqual(assets.length <= MAX_NFT_PER_TX, true, ERROR.TOO_MANY_ASSETS);

  log.debug("🔥 Burning assets");

  const result: BurnResult = {
    txHash: ""
  };

  const burnAssets: Asset[] = [];

  for (const asset of assets) {
    if (asset?.removeCollection) {
      // const collection: { assets: Asset[] } & {} = await blockchainProvider.fetchCollectionAssets(asset?.policyId!);
      // for (const a of collection?.assets) {
      //   burnAssets.push(a);
      // }
      log.warn("🔥 Remove collection is not supported yet");
    }

    const a: Asset = {
      unit: asset?.unit,
      quantity: "1",
    };

    burnAssets.push(a);
  }

  const tx: Transaction = new Transaction({ initiator: holder });

  tx.sendAssets(burnerAddress, burnAssets);
  tx.setTimeToExpire(TIME_TO_EXPIRE);

  const requiredSigners: string[] = [holderAddress];
  for (const w of wallets) {
    requiredSigners.push(w.getPaymentAddress());
  }
  tx.setRequiredSigners(requiredSigners);

  const unsignedTx: string = await tx.build();
  let signedTx: string = await holder.signTx(unsignedTx, true);
  signedTx = await wallet.signTx(signedTx, true);

  for (const w of wallets) {
    signedTx = await w.signTx(signedTx, true);
  }

  const txHash: string = await wallet.submitTx(signedTx);
  log.info("🐳 Transaction submitted", txHash);

  for (const asset of assets) {
    await deleteCacheValue({
      key: `nft:config:${asset?.assetName!}`,
    });

    if (options?.publish) {
      const { sender, queue } = getSender({ service: ResolverService });

      const buff: Buffer = Buffer.from(JSON.stringify({
        id: options?.id,
        type: options?.type,
        data: {
          ...asset,
          message: "Asset burned successfully"
        },
      }));

      sender.sendToQueue(queue, buff, {
        persistent: true,
        expiration: TEN_MINUTES,
      });
    }
  }

  if (!options?.skipWait) {
    await waitForTransaction(txHash);
  }

  if (options?.channel) {
    await Bun.sleep(FIVE_SECONDS);
    options!.channel!.ack(options!.msg);
  }

  result.txHash = txHash;
  return result;
};