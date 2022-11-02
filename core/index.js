import { C } from "lucid-cardano";

import * as T from "./transaction";
import * as L from "./lucid";
// import * as W from "./wallet"; -- Use Lucid instead.

import logger from "../Logger";

export const fetchNFTByAsset = async (asset) => {
  const response = await T.getAssetDetails(asset);
  return response || {};
};

export const fetchNFTByPolicyId = async (policyId) => {
  const response = await T.getMintedAssets(policyId, {});
  return response || [];
};

// @verifyData
export const verifySignature = (address, payload, { signature, key }) => {
  // const response = W.verifyData(address, payload, { signature, key });
  address = C.Address.from_bytes(Buffer.from(address, "hex")).to_bech32();
  const signedMessage = {
    signature: signature,
    key: key,
  };
  const hasSigned = L.lucid.verifyMessage(address, payload, signedMessage);
  logger.info(address, payload, signature, key);
  return hasSigned;
  // return response;
};

// @signData
export const signSignature = async (address, payload) => {
  // const address = await lucid.wallet.address();
  // const payload = utf8ToHex("Hello from Lucid!");
  const signedMessage = await L.lucid.newMessage(address, payload).sign();
  return signedMessage;
};