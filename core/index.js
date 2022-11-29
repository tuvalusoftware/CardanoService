import { C } from "lucid-cardano";

import * as T from "./transaction";
import * as L from "./lucid";

export const fetchNFTByAsset = async (asset) => {
  const response = await T.getAssetDetails(asset);
  return response || {};
};

export const fetchNFTByPolicyId = async (policyId) => {
  const response = await T.getMintedAssets(policyId, {});
  return response || [];
};

export const verifySignature = (address, payload, { signature, key }) => {
  address = C.Address.from_bytes(Buffer.from(address, "hex")).to_bech32();
  const signedMessage = {
    signature: signature,
    key: key,
  };
  const hasSigned = L.lucid.verifyMessage(address, payload, signedMessage);
  return hasSigned;
};

export const signSignature = async (address, payload) => {
  const signedMessage = await L.lucid.newMessage(address, payload).sign();
  return signedMessage;
};