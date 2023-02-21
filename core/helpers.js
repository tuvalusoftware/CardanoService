import * as L from "./lucid";

import { BlockfrostServerError } from "@blockfrost/blockfrost-js";
import { BlockfrostAPI } from "./transaction";

import { memoryCache } from "./cache";
import { errorTypes } from "./error.types";

import logger from "../Logger";

export const getMintedAssets = async (policyId, { page = 1, count = 100, order = "asc" }) => {
    try {
        const response = await BlockfrostAPI.assetsPolicyByIdAll(policyId, { page, count, order });
        let newValue = response
            .filter((asset) => parseInt(asset.quantity) === 1)
            .map((asset) => asset.asset);
        newValue = await Promise.all(newValue.map(async (asset) => await getAssetDetails(asset)));
        return newValue;
    } catch (error) {
        if (error instanceof BlockfrostServerError && error.status_code === 404) {
            return [];
        }
        throw new Error(errorTypes.COULD_NOT_FETCH_MINTED_ASSETS);
    }
};

export const getAssetDetails = async (asset) => {
    try {
        const address = await L.lucid.wallet.address();
        const utxo = await L.lucid.utxosAtWithUnit(address, asset);
        if (utxo.length > 0) {
            if (memoryCache.get(`${asset}`) !== undefined) {
                return memoryCache.get(`${asset}`);
            }
            const response = await BlockfrostAPI.assetsById(asset);
            if (parseInt(response.quantity) === 1 && !isEmpty(response.onchain_metadata)) {
                let rawMetadata = renameObjectKey(
                    response.onchain_metadata,
                    "Name",
                    "name"
                );
                const _assetName = response.asset_name;
                const _policyId = response.policy_id;
                let finalMetadata = rawMetadata;
                if (rawMetadata.hasOwnProperty(`${_policyId}`) && !isEmpty(rawMetadata[_policyId])) {
                    if (rawMetadata[_policyId].hasOwnProperty(`${_assetName}`) && !isEmpty(rawMetadata[_policyId][_assetName])) {
                        finalMetadata = rawMetadata[_policyId][_assetName];
                    }
                }
                if (isEmpty(finalMetadata)) {
                    throw new Error(errorTypes.METADATA_IS_EMPTY);
                }
                let assetDetails = {
                    asset: response.asset,
                    policyId: response.policy_id,
                    assetName: response.asset_name,
                    readableAssetName: Buffer.from(response.asset_name, "hex").toString(),
                    fingerprint: response.fingerprint,
                    quantity: parseInt(response.quantity),
                    initialMintTxHash: response.initial_mint_tx_hash,
                    mintOrBurnCount: parseInt(response.mint_or_burn_count),
                    onchainMetadata: finalMetadata,
                    originalOnchainMetadata: renameObjectKey(
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
        }
        return {};
    } catch (error) {
        if (error instanceof BlockfrostServerError && error.status_code === 404) {
            return {};
        }
        console.log(error);
        throw new Error(errorTypes.COULD_NOT_FETCH_ASSET_DETAILS);
    }
};

export const isEmpty = (value) => {
    if (value === null) {
        return true;
    } else if (typeof value !== "number" && value === "") {
        return true;
    } else if (typeof value === "undefined" || value === undefined) {
        return true;
    } else if (value !== null && typeof value === "object" && !Object.keys(value).length) {
        return true;
    } else {
        return false;
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