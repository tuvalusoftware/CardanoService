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
      next(new Error('Address is required'));
    }
    try {
      const assets = await core.getAssetsFromAddress(address);
      res.status(200).json({
        data: {
          assets: assets,
        }
      });
    } catch (error) {
      next(error);
    }
  },
  getNFT: async (req, res, next) => {
    const { assetId } = req.params;
    if (!assetId) {
      next(new Error('Asset ID is required'));
    }
    try {
      const nft = await core.getSpecificAssetByAssetId(assetId);
      res.status(200).json({
        data: {
          nftMetadata: nft,
        }
      });
    } catch (error) {
      next(error);
    }
  },
  getNFTs: async (req, res, next) => {
    const { policyId } = req.params;
    if (!policyId) {
      next(new Error('Policy ID is required'));
    }
    try {
      const nfts = await core.getSpecificAssetsByPolicyId(policyId);
      res.status(200).json({
        data: {
          nfts: nfts,
        }
      });
    } catch (error) {
      next(error);
    }
  }
};