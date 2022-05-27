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
      res.status(400).json({
        result: 'Request body invalid',
      });
    }
    try {
      await core.createNftTransaction(address, hash);
      res.status(200).json({
        result: 'true',
      });
    } catch (error) {
      res.status(400).json({
        result: error.message,
      });
    }
  },
  verifyHash: async (req, res, next) => {
    const { hash } = req.query;
    if (!hash) {
      res.status(400).json({
        result: 'Query parameters invalid',
      });
    }
    try {
      const result = await core.checkIfNftMinted(hash);
      res.status(200).json({
        result: `${result}`,
      });
      next();
    } catch (error) {
      res.status(400).json({
        result: error.message,
      });
    }
  },
  getPolicyId: async (req, res, next) => {
    res.status(200).json({
      result: core.getCurrentPolicyId(),
    });
  },
  verifySignature: async (req, res, next) => {
    const { address, payload, signature } = req.body;
    if (!address || !payload || !signature) {
      res.status(400).json({
        result: 'Request body invalid',
      });
    }
    try {
      const result = await core.verifySignature(address, payload, signature);
      res.status(200).json({
        result: `${result}`,
      });
    } catch (error) {
      res.status(400).json({
        result: error.message,
      });
    }
  },
};