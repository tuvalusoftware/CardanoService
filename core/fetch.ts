import { Asset, AssetMetadata } from "@meshsdk/core";
import { setCacheValue, getCacheValue } from ".";
import { blockchainProvider } from "./provider";
import { parseJson } from "./utils";
import { FetchOptions, FetchResult } from "./type";
import { fromUnit } from "lucid-cardano";
import axios from "axios";

const fuixlabsProvider = {
  fetchAssetMetadata: async (unit: string) => {
    const { policyId, assetName } = fromUnit(unit);
    try {
      const { data } = await axios.get(
        `https://preprod.koios.rest/api/v0/asset_info?_asset_policy=${policyId}&_asset_name=${assetName}`
      );
      const asset: any = data.find(
        (d: any) => d.asset_name === assetName && d.policy_id === policyId
      );
      const metadata: AssetMetadata =
        asset?.["minting_tx_metadata"]?.["721"]?.[policyId]?.[assetName!] || {};
      return metadata;
    } catch (error) {
      return {};
    }
  },
};

export const fetch = async ({ policyId }: FetchOptions) => {
  const collection: { assets: Asset[] } & {} =
    await blockchainProvider.fetchCollectionAssets(policyId!);
  console.log("[C]ollection", collection);
  const result: FetchResult = {};
  await Promise.all(
    collection?.assets?.map(async (a) => {
      const cached = await getCacheValue({ key: `nft:metadata:${a!.unit!}` });
      console.log("[C]ached", cached);
      if (!cached) {
        console.log("[N]ot cached");
        let info: AssetMetadata;
        try {
          info = await fuixlabsProvider.fetchAssetMetadata(a!.unit!);
        } catch (error) {
          throw error;
        }
        result[a!.unit!] = info;
        await setCacheValue({
          key: `nft:metadata:${a!.unit!}`,
          value: JSON.stringify(info),
        });
      } else {
        result[a!.unit!] = parseJson(cached);
      }
    })
  );
  return result;
};

export const getVersion = async ({ unit }: { unit: string }) => {
  const result: FetchResult = {};
  const cached = await getCacheValue({ key: `nft:metadata:${unit!}` });
  console.log("[C]ached", cached);
  if (!cached) {
    console.log("[N]ot cached");
    let info: AssetMetadata;
    try {
      info = await fuixlabsProvider.fetchAssetMetadata(unit!);
    } catch (error) {
      throw error;
    }
    result[unit!] = info;
    await setCacheValue({
      key: `nft:metadata:${unit!}`,
      value: JSON.stringify(info),
      expiredTime: -1,
    });
  } else {
    result[unit!] = parseJson(cached);
  }
  console.log("[M]etadata", result);
  return Number(result[unit!].version! || 0) + 1;
};

console.log(
  await getVersion({
    unit: "79d82c2e394992ddd756de040a51ff82ff3ee28819c92bcf656fe7807fef5523d6e7b1f607de0cc04d9c9797d570ab7ec7061166f7307d702a1cb792",
  })
);
