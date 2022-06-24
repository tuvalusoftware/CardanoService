/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:nft');

const { CustomError } = require('../CustomError');

module.exports = {
  getAssets: async (req, res, next) => {
    const { address } = req.params;
    /* istanbul ignore if */
    if (!address) {
      return next(new CustomError(10029));
    }
    try {
      const assets = await core.getAssetsFromAddress(address);
      return res.status(200).json({
        data: {
          assets: assets,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(new CustomError(10010));
    }
  },
  getNFT: async (req, res, next) => {
    const { assetId } = req.params;
    /* istanbul ignore if */
    if (!assetId) {
      return next(new CustomError(10028));
    }
    try {
      const nft = await core.getSpecificAssetByAssetId(assetId);
      return res.status(200).json({
        data: {
          nftMetadata: nft,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(new CustomError(10011));
    }
  },
  getNFTs: async (req, res, next) => {
    const { policyId } = req.params;
    /* istanbul ignore if */
    if (!policyId) {
      return next(new CustomError(10027));
    }
    try {
      const assets = await core.getSpecificAssetsByPolicyId(policyId);
      const nfts = assets.filter(nft => parseInt(nft.quantity) === 1);
      for (let id = 0; id < nfts.length; ++id) {
        nfts[id].metadata = await core.getSpecificAssetByAssetId(nfts[id].asset);
      }
      return res.status(200).json({
        data: {
          nfts: nfts,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(new CustomError(10012));
    }
  }
};