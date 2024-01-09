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
import { FIFTEEN_SECONDS, MAX_NFT_PER_TX, NETWORK_NAME, ONE_HOUR, TEN_SECONDS, TIME_TO_EXPIRE } from "./config";
import { ERROR } from "./error";
import { assertEqual, delay, getOrDefault, parseJson, waitForTransaction } from "./utils";
import { getCacheValue, setCacheValue } from ".";
import { ResolverService, getOrCreateSender } from "./config/rabbit";
import { deleteCacheValue } from "./config/redis";

const log: Logger<ILogObj> = new Logger();

log.info("Wallet address:", walletAddress);
log.info("Holder address:", holderAddress);
log.info("Burner address:", burnerAddress);

const generateNativeScript = async ({ keyHash }: { keyHash: string }): Promise<NativeScript> => {
  let oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + Math.floor(Math.random() * 1000) + 1);

  await delay(5);
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

  let numOfAssets: number = 0;

  for (const asset of assets) {
    const nativeScript: NativeScript = await generateNativeScript({ keyHash });
    const forgingScript: ForgeScript = getOrDefault(asset?.forgingScript, ForgeScript.fromNativeScript(nativeScript));
    const assetMetadata: AssetMetadata = getOrDefault(asset?.metadata, {});

    const cached = await getCacheValue({
      key: `nft:config:${asset?.assetName!}`,
    });

    if (cached) {
      log.warn("[?] Asset already exists", asset?.assetName!);
      if (options?.publish) {
        const { sender, queue } = await getOrCreateSender({ queue: getOrDefault(options?.replyTo, ResolverService) });

        const buff: Buffer = Buffer.from(JSON.stringify(parseJson(cached)));

        sender.sendToQueue(queue!, buff, {
          persistent: true,
          expiration: ONE_HOUR,
          correlationId: options?.correlationId,
        });

        continue;
      } else {
        throw ERROR.ASSET_ALREADY_EXISTS;
      }
    }

    const info: Mint = {
      assetName: asset?.assetName!,
      assetQuantity: "1",
      metadata: assetMetadata!,
      label: "721",
      recipient: holderAddress,
    };

    tx.mintAsset(forgingScript!, info);

    numOfAssets++;

    const { unit, policyId } = toAsset(forgingScript as string, info);
    result.assets[asset?.assetName] = {
      unit,
      forgingScript,
      policyId,
      assetName: asset?.assetName,
    };
  }

  if (numOfAssets > 0) {
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
        key: `nft:config:${asset?.assetName!}`,
        value: dat,
        expiredTime: -1,
      });

      if (options?.publish) {
        const { sender, queue } = await getOrCreateSender({ queue: getOrDefault(options?.replyTo, ResolverService) });
        const buff: Buffer = Buffer.from(JSON.stringify(dat));
        sender.sendToQueue(queue!, buff, {
          persistent: true,
          expiration: ONE_HOUR,
          correlationId: options?.correlationId,
        });
      }
    }

    if (!options?.skipWait) {
      await waitForTransaction(txHash);
    } else {
      await delay(FIFTEEN_SECONDS);
    }

    if (options?.channel) {
      await delay(TEN_SECONDS);
      options!.channel!.ack(options!.msg);
    }

    result.txHash = txHash;
  }
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
      const { sender, queue } = await getOrCreateSender({ queue: getOrDefault(options?.replyTo, ResolverService) });

      const buff: Buffer = Buffer.from(JSON.stringify({
        id: options?.id,
        type: options?.type,
        data: {
          ...asset,
          message: "Asset burned successfully"
        },
      }));

      sender.sendToQueue(queue!, buff, {
        persistent: true,
        expiration: ONE_HOUR,
        correlationId: options?.correlationId,
      });
    }
  }

  if (!options?.skipWait) {
    await waitForTransaction(txHash);
  } else {
    await delay(FIFTEEN_SECONDS);
  }

  if (options?.channel) {
    await delay(TEN_SECONDS);
    options!.channel!.ack(options!.msg);
  }

  result.txHash = txHash;
  return result;
};