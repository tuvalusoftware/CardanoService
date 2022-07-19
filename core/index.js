import * as U from "./utils";
import * as W from "./wallet";

export const fetchNFTByAsset = async (asset) => {
  const response = await U.getAssetDetails(asset);
  return response || {};
};

export const fetchNFTByPolicyId = async (policyId) => {
  const response = await U.getMintedAssets(policyId);
  return response || [];
};

export const verifySignature = (address, payload, { signature, key }) => {
  const response = W.verifyData(address, payload, { signature, key });
  return response;
};