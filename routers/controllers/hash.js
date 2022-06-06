/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  storeHash: async (req, res, next) => {
    const { address, hashOfDocument } = req.body;
    if (!address || !hashOfDocument) {
      next(new Error('Address and hash are required'));
    }
    try {
      const policyId = await core.createNftTransaction(address, hashOfDocument);
      res.status(200).json({
        data: {
          result: true,
          policyId: policyId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  verifyHash: async (req, res, next) => {
    const { policyID, hashOfDocument } = req.query;
    if (!policyID || !hashOfDocument) {
      next(new Error('Policy ID and hash of document are required'));
    }
    try {
      const result = await core.checkIfNftMinted(policyID, hashOfDocument);
      res.status(200).json({
        data: {
          result: result,
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
          result: result,
        }
      });
    } catch (error) {
      next(error);
    }
  },
  verifySignatures: async (req, res, next) => {
    const { signatures } = req.body;
    if (!signatures) {
      next(new Error('Request body invalid'));
    }
    try {
      const results = await core.verifySignatures(signatures);
      res.status(200).json({
        data: {
          results: results,
        }
      });
    } catch (error) {
      next(error);
    }
  },
};