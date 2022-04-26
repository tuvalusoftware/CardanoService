/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const Blockfrost = require('@blockfrost/blockfrost-js');
require('dotenv').config();

const blockFrostApi = new Blockfrost.BlockFrostAPI({
  projectId: process.env.blockFrostApiKey,
  isTestnet: process.env.isTestnet,
});

const getLatestBlock = async () => {
  const latestBlock = await blockFrostApi.blocksLatest();
  return latestBlock;
};

const getLatestEpoch = async () => {
  const latestEpoch = await blockFrostApi.epochsLatest();
  return latestEpoch;
};

const getProtocolParameters = async (epoch) => {
  const protocolParameters = await blockFrostApi.epochsParameters(epoch);
  return protocolParameters;
};

const getLatestEpochProtocolParameters = async () => {
  const latestEpoch = await getLatestEpoch();
  const latestBlock = await getLatestBlock();
  const protocolParameters = await getProtocolParameters(latestEpoch.epoch);
  return { ...protocolParameters, latestBlock };
};

const getMetadataByLabel = async (label) => {
  const metadata = await blockFrostApi.metadataTxsLabel(label);
  return metadata;
}

const getAssetsFromAddress = async (address) => {
  let listAssets = [];
  try {
    listAssets = await blockFrostApi.addresses(address);
  } catch (error) {
    return listAssets;
  }
  return listAssets.amount;
};

const getSpecificAssetByAssetId = async (asset) => {
  const assetInfo = await blockFrostApi.assetsById(asset);
  return assetInfo;
};

const getSpecificAssetByPolicyId = async (policyId) => {
  const assetInfo = await blockFrostApi.assetsPolicyById(policyId);
  return assetInfo;
};

const submitSignedTransaction = async (signedTransaction) => {
  const txHash = await blockFrostApi.txSubmit(signedTransaction);
  return txHash;
}

module.exports = {
  getLatestBlock,
  getLatestEpoch,
  getProtocolParameters,
  getLatestEpochProtocolParameters,
  getMetadataByLabel,
  getAssetsFromAddress,
  getSpecificAssetByAssetId,
  getSpecificAssetByPolicyId,
  submitSignedTransaction,
};