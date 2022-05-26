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
      throw new Error('Request body invalid');
    }
    try {
      await core.createNftTransaction(address, hash);
      res.json({
        result: 'true',
      });
    } catch (error) {
      res.json({
        result: error.message,
      });
    }
  },
  verifyHash: async (req, res, next) => {
    const { hash } = req.query;
    if (!hash) {
      throw new Error('Query parameters invalid');
    }
    try {
      const result = await core.checkIfNftMinted(hash);
      res.json({
        result: `${result}`,
      });
      next();
    } catch (error) {
      res.json({
        result: error.message,
      });
    }
  },
  getPolicyId: async (req, res, next) => {
    res.json({
      result: core.getCurrentPolicyId(),
    });
  },
  verifySignature: async (req, res, next) => {
    const { address, payload, signature } = req.body;
    if (!address || !payload || !signature) {
      throw new Error('Request body invalid');
    }
    try {
      const result = await core.verifySignature(address, payload, signature);
      res.json({
        result: `${result}`,
      });
    } catch (error) {
      res.json({
        result: error.message,
      });
    }
  },
};