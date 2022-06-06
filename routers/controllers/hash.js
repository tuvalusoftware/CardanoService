/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  storeHash: async (req, res, next) => {
    const { address, hash } = req.body;
    if (!address || !hash) {
      next(new Error('Address and hash are required'));
    }
    try {
      await core.createNftTransaction(address, hash);
      res.status(200).json({
        data: {
          result: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  verifyHash: async (req, res, next) => {
    const { hash } = req.query;
    if (!hash) {
      next(new Error('Hash is required'));
    }
    try {
      const result = await core.checkIfNftMinted(hash);
      res.status(200).json({
        data: {
          result: `${result}`,
        },
      });
      next();
    } catch (error) {
      next(error);
    }
  },
  verifySignature: async (req, res, next) => {
    const { address, payload, signature } = req.body;
    if (!address || !payload || !signature) {
     next(new Error('Request body invalid'));
    }
    try {
      const result = await core.verifySignature(address, payload, signature);
      res.status(200).json({
        data: {
          result: `${result}`,
        }
      });
    } catch (error) {
      next(error);
    }
  },
};