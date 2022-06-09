/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  getAssets: async (req, res, next) => {
    const { address } = req.params;
    if (!address) {
      return next(new Error('Address is required'));
    }
    try {
      const assets = await core.getAssetsFromAddress(address);
      res.status(200).json({
        data: {
          assets: assets,
        }
      });
    } catch (error) {
      return next(error);
    }
  },
  getNFT: async (req, res, next) => {
    const { assetId } = req.params;
    if (!assetId) {
      return next(new Error('Asset ID is required'));
    }
    try {
      const nft = await core.getSpecificAssetByAssetId(assetId);
      res.status(200).json({
        data: {
          nftMetadata: nft,
        }
      });
    } catch (error) {
      return next(error);
    }
  },
  getNFTs: async (req, res, next) => {
    const { policyId } = req.params;
    if (!policyId) {
      return next(new Error('Policy ID is required'));
    }
    try {
      const assets = await core.getSpecificAssetsByPolicyId(policyId);
      const nfts = assets.filter(nft => parseInt(nft.quantity) === 1);
      for (let id = 0; id < nfts.length; ++id) {
        nfts[id].metadata = await core.getSpecificAssetByAssetId(nfts[id].asset);
      }
      res.status(200).json({
        data: {
          nfts: nfts,
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};