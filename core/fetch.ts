import { Asset, AssetMetadata } from "@meshsdk/core";
import { setCacheValue, getCacheValue } from ".";
import { blockchainProvider } from "./provider";
import { parseJson } from "./utils";
import { FetchOptions, FetchResult } from "./type";

export const fetch = async ({ policyId }: FetchOptions) => {
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
      result[a!.unit!] = parseJson(cached);
    }
  }));
  return result;
};

export const getVersion = async ({ unit }: { unit: string }) => {
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
    result[unit!] = parseJson(cached);
  }
  console.log(result);
  return Number(result[unit!].version! || 0) + 1;
};