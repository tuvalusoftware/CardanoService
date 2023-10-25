import * as L from "./lucid";

import { BlockfrostServerError } from "@blockfrost/blockfrost-js";
import { BlockfrostAPI, maestroClient } from "./transaction";

import { memoryCache } from "./cache";
import { errorTypes } from "./error.types";

import logger from "../Logger";
import { Lucid } from "lucid-cardano";

export const getMintedAssets = async (policyId, { page = 1, count = 100000, order = "asc" }) => {
    logger.info(`policyId ${policyId}`);
    try {
        const response = await maestroClient.assets.policyInfo(policyId, { page, count, order });
        console.log(response);
        let newValue = (response?.data || []).filter((asset) => parseInt(asset?.total_supply) === 1)
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
        const HOLDER_MNEMONIC = process.env.HOLDER_MNEMONIC;
        console.log(HOLDER_MNEMONIC);

        let LUCID = await Lucid.new(
            // new Blockfrost(
            // 	BlockfrostConfig.serverUrl,
            // 	BlockfrostConfig.apiKey,
            // ),
            new Maestro({
                network: capitalize(BlockfrostConfig.network),
                apiKey: MaestroConfig.apiKey,
                turboSubmit: false,
            }),
            capitalize(BlockfrostConfig.network),
        );

        LUCID.selectWalletFromPrivateKey(A.getCurrentAccount(
            process.env.ENVIRONMENT === "develop" ? process.env.DEVELOP_MNEMONIC : process.env.HOLDER_MNEMONIC
        ).paymentKey.to_bech32());

        let utxo = await LUCID.utxoByUnit(asset);
        if (utxo) {
            utxo = [utxo];
        } else {
            utxo = [];
        }
        if (utxo.length > 0) {
            if (memoryCache.get(`${asset}`) !== undefined) {
                return memoryCache.get(`${asset}`);
            }
            const response = await maestroClient.assets.assetInfo(asset)?.data || {};
            console.log("helpers - response", response);
            if (parseInt(response.total_supply) === 1 && !isEmpty(response?.asset_standards?.cip25_metadata)) {
                // let rawMetadata = renameObjectKey(
                //     response?.asset_standards?.cip25_metadata,
                //     "Name",
                //     "name"
                // );
                // const _assetName = response.asset_name;
                // const _policyId = response.policy_id;
                // let finalMetadata = rawMetadata;
                // if (rawMetadata.hasOwnProperty(`${_policyId}`) && !isEmpty(rawMetadata[_policyId])) {
                //     if (rawMetadata[_policyId].hasOwnProperty(`${_assetName}`) && !isEmpty(rawMetadata[_policyId][_assetName])) {
                //         finalMetadata = rawMetadata[_policyId][_assetName];
                //     }
                // }
                // if (isEmpty(finalMetadata)) {
                //     throw new Error(errorTypes.METADATA_IS_EMPTY);
                // }
                const rawMetadata = response?.asset_standards?.cip25_metadata || {};
                let assetDetails = {
                    asset,
                    policyId: rawMetadata?.policy,
                    assetName: response?.asset_name,
                    readableAssetName: Buffer.from(response?.asset_name_ascii, "hex").toString(),
                    fingerprint: response?.fingerprint,
                    quantity: parseInt(response?.total_supply),
                    initialMintTxHash: response?.first_mint_tx,
                    mintOrBurnCount: parseInt(response?.mint_tx_count) + parseInt(response?.burn_tx_count),
                    mintCount: parseInt(response?.mint_tx_count),
                    burnCount: parseInt(response?.burn_tx_count),
                    onchainMetadata: response?.asset_standards?.cip25_metadata,
                    // originalOnchainMetadata: renameObjectKey(
                    //     response.onchain_metadata,
                    //     "Name",
                    //     "name"
                    // ),
                    // metadata: response.metadata,
                };
                const newValue = deleteObjectKey(assetDetails, "");
                memoryCache.set(`${asset}`, newValue, 604800);
                return newValue;
            }
        }
        return {};
    } catch (error) {
        // if (error instanceof BlockfrostServerError && error.status_code === 404) {
        //     return {};
        // }
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