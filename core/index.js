import * as T from "./transaction";
import * as L from "./lucid";
// import * as W from "./wallet"; -- Use Lucid instead.

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
  const signedMessage = {
    signature: signature,
    key: key,
  };
  const hasSigned = L.lucid.verifyMessage(address, payload, signedMessage);
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