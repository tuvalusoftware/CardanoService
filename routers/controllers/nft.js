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
    try {
      const assets = await core.getAssetsFromAddress(address);
      res.json(assets);
    } catch (error) {
      next(error);
    }
  },
  getNFT: async (req, res, next) => {
    const { assetId } = req.params;
    try {
      const nfts = await core.getSpecificAssetByAssetId(assetId);
      res.json(nfts);
    } catch (error) {
      next(error);
    }
  }
};