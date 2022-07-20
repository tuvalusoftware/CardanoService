import * as dotenv from "dotenv";
dotenv.config();

import * as L from "./lucid";
import * as W from "./wallet";

import { errorTypes } from "./error.types";

import { memoryCache } from "./cache";

import Logger from "../Logger";

export const MintNFT = async ({ assetName, metadata, options }) => {
  Logger.info("MintNFT");
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
    Logger.error(error);
    throw new Error(errorTypes.TRANSACTION_REJECT);
  }

  return { policy, asset };
};

export const BurnNFT = async ({ config }) => {
  Logger.info("BurnNFT");
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
      await signedTx.submit();

      if (memoryCache.get(config.asset)) {
        memoryCache.del(config.asset);
      }      
    } catch (error) {
      Logger.error(error);
      throw new Error(errorTypes.TRANSACTION_REJECT);
    }

  } else {
    throw new Error(errorTypes.NFT_COULD_NOT_BE_FOUND_IN_WALLET);
  }
};

export const getMintedAssets = async (policyId, { page = 1, count = 100, order = "asc" }) => {
  Logger.info("getMintedAssets");
  try {
    if (memoryCache.get(`${policyId}`) !== undefined) {
      return memoryCache.get(`${policyId}`);
    }
    const response = await Blockfrost(`assets/policy/${policyId}?page=${page}&count=${count}&order=${order}`);
    let newValue = response
      .filter((asset) => parseInt(asset.quantity) === 1)
      .map((asset) => asset.asset);
    newValue = await Promise.all(newValue.map(async (asset) => await getAssetDetails(asset)));
    memoryCache.set(`${policyId}`, newValue, 60);
    return newValue;
  } catch (error) {
    Logger.error(error);
    if (error.message == 404) {
      return [];
    }
    throw new Error(errorTypes.COULD_NOT_FETCH_MINTED_ASSETS);
  }
};

export const getAssetDetails = async (asset) => {
  Logger.info("getAssetDetails");
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
    return {};
  } catch (error) {
    Logger.error(error);
    if (error.message == 404) {
      return {};
    }
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
  Logger.info("Blockfrost...");
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
      Logger.error(response);
      throw new Error(response.status);
    }
    return response.json();
  });
};