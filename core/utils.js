import { errorTypes } from "./error.types";

import NodeCache from "node-cache";
const memoryCache = new NodeCache();

/**
 * @throws COULD_NOT_FETCH_MINTED_ASSETS
 */
export const getMintedAssets = async (policyId, { page = 1, count = 100, order = "asc" }) => {
  try {
    if (memoryCache.get(`${policyId}`) !== undefined) {
      return memoryCache.get(`${policyId}`);
    }
    const response = await Blockfrost(`assets/policy/${policyId}?page=${page}&count=${count}&order=${order}`);
    const newValue = response
      .filter((asset) => parseInt(asset.quantity) === 1)
      .map((asset) => asset.asset);
    memoryCache.set(`${policyId}`, newValue, 60);
    return newValue;
  } catch (error) {
    console.log(error);
    throw new Error(errorTypes.COULD_NOT_FETCH_MINTED_ASSETS);
  }
};

/**
 * @param {string} asset - asset is a concatenation of the policy_id and hex-encoded asset_name.
 * @throws COULD_NOT_FETCH_ASSET_DETAILS
 */
export const getAssetDetails = async (asset) => {
  try {
    if (memoryCache.get(`${asset}`) !== undefined) {
      return memoryCache.get(`${asset}`);
    }
    const response = await Blockfrost(`assets/${asset}`);
    if (parseInt(response.quantity) === 1 && response.onchain_metadata) {
      const assetDetails = {
        asset: response.asset,
        policyId: response.policy_id,
        assetName: response.asset_name,
        readableAssetName: Buffer.from(response.asset_name, "hex").toString(),
        fingerprint: response.fingerprint,
        quantity: parseInt(response.quantity),
        initialMintTxHash: response.initial_mint_tx_hash,
        mintOrBurnCount: parseInt(response.mint_or_burn_count),
        onchainMetadata: renameObjectKey(
          response.onchain_metadata,
          "Name",
          "name"
        ),
        metadata: response.metadata,
      };
      const newValue = deleteObjectKey(assetDetails, "");
      memoryCache.set(`${asset}`, newValue, 604800);
      return newValue;
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error(errorTypes.COULD_NOT_FETCH_ASSET_DETAILS);
  }
};

export const fromLovelace = (lovelace) => lovelace / 1000000;
export const toLovelace = (ada) => ada * 1000000;

export const renameObjectKey = (object, oldKey, newKey) => {
  let newObject = { ...object };
  if (oldKey in newObject) {
    newObject[newKey] = newObject[oldKey];
    delete newObject[oldKey];
  }
  return newObject;
};

export const deleteObjectKey = (object, key) => {
  let newObject = {};
  if (object) {
    Object.keys(object).forEach((objectKey) => {
      if (typeof object[objectKey] === "object") {
        newObject = {
          ...newObject,
          [objectKey]: deleteObjectKey(object[objectKey], key),
        };
      } else if (objectKey !== key) {
        newObject = {
          ...newObject,
          [objectKey]: object[objectKey],
        };
      }
    });
  }
  return newObject;
};

export async function delay(delayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}

const Blockfrost = async (endpoint, headers, body) => {
  return await request(
    process.env.CARDANO_NETWORK == 0 ? "https://cardano-testnet.blockfrost.io/api/v0/" : "https://cardano-mainnet.blockfrost.io/api/v0/",
    endpoint, headers, body
  );
};

const request = async (base, endpoint, headers, body) => {
  return await fetch(base + endpoint, {
    headers: {
      project_id: process.env.BLOCKFROST_APIKEY,
      ...headers,
    },
    method: body ? "POST" : "GET",
    body,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
};