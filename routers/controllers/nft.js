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
      throw new Error('URL invalid');
    }
    try {
      const assets = await core.getAssetsFromAddress(address);
      res.json(assets);
    } catch (error) {
      next(error);
    }
  },
  getNFT: async (req, res, next) => {
    const { assetId } = req.params;
    if (!assetId) {
      throw new Error('URL invalid');
    }
    try {
      const nfts = await core.getSpecificAssetByAssetId(assetId);
      res.json(nfts);
    } catch (error) {
      next(error);
    }
  }
};