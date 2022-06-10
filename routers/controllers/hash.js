/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  storeHash: async (req, res, next) => {
    const { address, hashOfDocument, previousHashOfDocument, originPolicyId } = req.body;
    if (!address || !hashOfDocument) {
      return next(new Error('Address and hash of document are required'));
    }
    const isUpdate = (previousHashOfDocument && previousHashOfDocument !== 'EMPTY') && (originPolicyId && originPolicyId !== 'EMPTY');
    let fakeHashOfDocument = hashOfDocument;
    if (isUpdate) {
      fakeHashOfDocument = `${fakeHashOfDocument},${previousHashOfDocument},${originPolicyId}`;
    }
    try {
      const token = await core.createNftTransaction(address, fakeHashOfDocument, isUpdate);
      res.status(200).json({
        data: {
          result: true,
          token: token,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  verifyHash: async (req, res, next) => {
    const { policyID, hashOfDocument } = req.query;
    if (!policyID || !hashOfDocument) {
      return next(new Error('Policy ID and hash of document are required'));
    }
    try {
      const result = await core.checkIfNftMinted(policyID, hashOfDocument);
      res.status(200).json({
        data: {
          result: result,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  getPolicyId: async (req, res, next) => {
    const { hashOfDocument } = req.query;
    if (!hashOfDocument) {
      return next(new Error('Hash of document is required'));
    }
    try {
      const { policyId } = await core.getPolicyIdFrommNemonic(hashOfDocument, false);
      res.status(200).json({
        data: {
          policyId: policyId,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
  verifySignature: async (req, res, next) => {
    const { address, payload, signature } = req.body;
    if (!address || !payload || !signature) {
     return next(new Error('Request body invalid'));
    }
    try {
      const result = await core.verifySignature(address, payload, signature);
      res.status(200).json({
        data: {
          result: result,
        }
      });
    } catch (error) {
      return next(error);
    }
  },
  verifySignatures: async (req, res, next) => {
    const { signatures } = req.body;
    if (!signatures) {
      return next(new Error('Request body invalid'));
    }
    try {
      const results = await core.verifySignatures(signatures);
      res.status(200).json({
        data: {
          results: results,
        }
      });
    } catch (error) {
      return next(error);
    }
  },
};