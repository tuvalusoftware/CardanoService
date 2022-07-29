import * as dotenv from "dotenv";
dotenv.config();

import * as L from "./lucid";
import * as W from "./wallet";

import { errorTypes } from "./error.types";

import { memoryCache } from "./cache";

import Logger from "../Logger";

import axios from "axios";

export const MintNFT = async ({ assetName, metadata, options }) => {
  let policy = W.createLockingPolicyScript();
  policy.script = Buffer.from(policy.script.to_bytes(), "hex").toString("hex");
  
  if (options.policy && options.policy.id && options.policy.script && options.policy.ttl && options.policy.reuse && options.policy.reuse == true) {
    policy = options.policy;
  }

  metadata.timestamp = new Date().getTime();
  metadata.policy = policy.id;
  metadata.ttl = policy.ttl;

  // const utxos = await L.lucid.wallet.getUtxos();
  const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;

  const address = await L.lucid.wallet.address();
  const utxo = await L.lucid.utxosAtWithUnit(address, asset);
  if (utxo.length > 0) {
    throw new Error(errorTypes.NFT_MINTED);
  }

  let mintToken = { 
    [asset]: 1n,
  };

  if (options.burn && options.burn == true) {
    mintToken[options.asset] = -1n;
  }

  if (options.policy && options.policy.reuse && options.policy.reuse == true && options.policy.id !== policy.id) {
    Logger.error("POLICY_ID_DIFFERENCT:", options.policy.id, policy.id);
    throw new Error(errorTypes.ERROR_WHILE_REUSING_POLICY_ID);
  }

  const tx = await L.lucid.newTx()
  // .collectFrom(utxos)
  .attachMintingPolicy(policy)
  .attachMetadata(721, {
    [policy.id]: {
      [Buffer.from(assetName, "hex").toString("hex")]: metadata,
    },
  })
  .mintAssets(mintToken)
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
  // const utxos = await L.lucid.wallet.getUtxos();
  const address = await L.lucid.wallet.address();
  const utxo = await L.lucid.utxosAtWithUnit(address, config.asset);
  
  if (utxo.length > 0) {

    const tx = await L.lucid.newTx()
    .collectFrom(utxo)
    .attachMintingPolicy(config.policy)
    .mintAssets({
      [config.asset]: -1n
    })
    .validTo(L.lucid.utils.slotToUnixTime(config.policy.ttl))
    .complete();
    
    const signedTx = await tx.sign().complete();
    
    try {
      await signedTx.submit();

      Logger.info("Delete ", config.asset);

      if (memoryCache.get(config.asset)) {
        memoryCache.ttl(config.asset, 0);
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
  // console.log(policyId);
  try {
    if (memoryCache.get(`${policyId}`) !== undefined) {
      return memoryCache.get(`${policyId}`);
    }
    const response = await Blockfrost(`assets/policy/${policyId}?page=${page}&count=${count}&order=${order}`, {}, {});
    let newValue = response
      .filter((asset) => parseInt(asset.quantity) === 1)
      .map((asset) => asset.asset);
    newValue = await Promise.all(newValue.map(async (asset) => await getAssetDetails(asset)));
    memoryCache.set(`${policyId}`, newValue, 30);
    return newValue;
  } catch (error) {
    Logger.error(error);
    if (error.status == 404) {
      return [];
    }
    throw new Error(errorTypes.COULD_NOT_FETCH_MINTED_ASSETS);
  }
};

export const getAssetDetails = async (asset) => {
  // console.log(asset);
  try {
    if (memoryCache.get(`${asset}`) !== undefined) {
      return memoryCache.get(`${asset}`);
    }
    const response = await Blockfrost(`assets/${asset}`, {}, {});
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
    if (error.status == 404) {
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
  try {
    return await request(
      process.env.CARDANO_NETWORK == 0 ? "https://cardano-testnet.blockfrost.io/api/v0/" : "https://cardano-mainnet.blockfrost.io/api/v0/",
      endpoint, headers, body
    );
  } catch (error) {
    console.log(error);
    throw new Error("BAD");
  }
};

const request = async (base, endpoint, headers, body) => {
  // try {
    if (body && Object.keys(body).length > 0) {
      return await axios.post(base + endpoint, body, {
        headers: {
          project_id: process.env.BLOCKFROST_APIKEY,
          ...headers,
        },
      }).then(({ data }) => {
        return data;
      }).catch(error => {
        if (error.response) {
          Logger.error(error.response.data);
          Logger.error(error.response.headers);
          Logger.error(error.response.status);
          Logger.error(error.response.message);
          throw new Error(error.response);
        } else {
          throw new Error(error);
        }
      });
    } else {
      return await axios.get(base + endpoint, {
        headers: {
          project_id: process.env.BLOCKFROST_APIKEY,
          ...headers,
        },
      }).then(({ data }) => {
        return data;
      }).catch(error => {
        if (error.response) {
          Logger.error(error.response.data);
          Logger.error(error.response.headers);
          Logger.error(error.response.status);
          Logger.error(error.response.message);
          throw new Error(error.response);
        } else {
          throw new Error(error);
        }
      });
    }
  // } catch (error) {
  //   Logger.error(error);
  //   throw new Error(error.message || error);
  // }
  // return await fetch(base + endpoint, {
  //   headers: {
  //     project_id: process.env.BLOCKFROST_APIKEY,
  //     ...headers,
  //   },
  //   method: body ? "POST" : "GET",
  //   body,
  // }).then((response) => {
  //   if (!response.ok) {
  //     console.log(response);
  //     throw new Error(response.status);
  //   }
  //   return response.json();
  // });
};