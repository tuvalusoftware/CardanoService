import * as U from "./utils";
import * as W from "./wallet";

/**
 * 
 * @param {*} asset 
 */
export const fetchNFTByAsset = async (asset) => {
  const response = await U.getAssetDetails(asset);
  return response;
};

/**
 * 
 * @param {*} policyId 
 */
export const fetchNFTByPolicyId = async (policyId) => {
  const response = await U.getMintedAssets(policyId);
  return response;
};

/**
 * 
 * @param {*} address 
 * @param {*} payload 
 * @param {*} signature
 * @param {*} key 
 */
export const verifySignature = (address, payload, { signature, key }) => {
  const response = W.verifyData(address, payload, { signature, key });
  return response;
};