import { Asset, AssetMetadata } from "@meshsdk/core";
import { setCacheValue, getCacheValue } from ".";
import { blockchainProvider } from "./provider";
import { clearAllKeysFromCache, deleteCacheValue } from "./config/redis";
import { parseStrToJson } from "./error";

export interface FetchOptions {
  policyId: string;
}

interface FetchResult {
  [key: string]: any;
}

export const fetch = async ({ policyId }: FetchOptions) => {
  await clearAllKeysFromCache();
  const collection: { assets: Asset[] } & {} = await blockchainProvider.fetchCollectionAssets(policyId!);
  const result: FetchResult = {};
  await Promise.all(collection?.assets?.map(async (a) => {
    const cached = await getCacheValue({ key: `nft:metadata:${a!.unit!}` });
    if (!cached) {
      let info: AssetMetadata;
      try {
        info = await blockchainProvider.fetchAssetMetadata(a!.unit!);
      } catch (error) {
        throw error;
      }
      result[a!.unit!] = info;
      await setCacheValue({ key: `nft:metadata:${a!.unit!}`, value: JSON.stringify(info) });
    } else {
      result[a!.unit!] = parseStrToJson(cached);
    }
  }));
  return result;
};

export const getVersion = async ({ unit }: { unit: string }) => {
  await clearAllKeysFromCache();
  const result: FetchResult = {};
  const cached = await getCacheValue({ key: `nft:metadata:${unit!}` });
  if (!cached) {
    let info: AssetMetadata;
    try {
      info = await blockchainProvider.fetchAssetMetadata(unit!);
    } catch (error) {
      throw error;
    }
    result[unit!] = info;
    await setCacheValue({ key: `nft:metadata:${unit!}`, value: JSON.stringify(info), expiredTime: -1 });
  } else {
    result[unit!] = parseStrToJson(cached);
  }
  return Number(result[unit!].version! || 0) + 1;
};