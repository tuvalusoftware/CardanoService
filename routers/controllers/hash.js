/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:hash');

const { CustomError } = require('../CustomError');

module.exports = {
  storeHash: async (req, res, next) => {
    const { address, hashOfDocument, previousHashOfDocument, originPolicyId } = req.body;
    if (!address || !hashOfDocument) {
      return next(new CustomError(10005));
    }
    const isUpdate = (previousHashOfDocument && previousHashOfDocument !== 'EMPTY') && (originPolicyId && originPolicyId !== 'EMPTY');
    let fakeHashOfDocument = hashOfDocument;
    if (isUpdate) {
      fakeHashOfDocument = `${fakeHashOfDocument},${previousHashOfDocument},${originPolicyId}`;
    }
    try {
      const token = await core.createNftTransaction(address, fakeHashOfDocument, isUpdate);
      return res.status(200).json({
        data: {
          result: true,
          token: token,
        },
      });
    } catch (error) {
      logger.error(error);
      if (error instanceof CustomError) {
        return next(error);
      }
      /* istanbul ignore next */
      return res.status(200).json({
        data: {
          result: false,
        },
      });
    }
  },
  verifyHash: async (req, res, next) => {
    const { policyID, hashOfDocument } = req.query;
    if (!policyID || !hashOfDocument) {
      return next(new CustomError(10006));
    }
    try {
      const result = await core.checkIfNftMinted(policyID, hashOfDocument);
      return res.status(200).json({
        data: {
          result: result,
        },
      });
    } catch (error) {
      logger.error(error);
      if (error instanceof CustomError) {
        return next(error);
      }
      /* istanbul ignore next */
      return res.status(200).json({
        data: {
          result: false,
        },
      });
    }
  },
  getPolicyId: async (req, res, next) => {
    const { hashOfDocument } = req.query;
    if (!hashOfDocument) {
      return next(new CustomError(10007));
    }
    try {
      const { policyId } = await core.getPolicyIdFromHashOfDocument(hashOfDocument);
      return res.status(200).json({
        data: {
          policyId: policyId,
        },
      });
    } catch (error) {
      logger.error(error);
      return next(new CustomError(10013));
    }
  },
  verifySignature: async (req, res, next) => {
    const { address, payload, signature } = req.body;
    if (!address || !payload || !signature) {
      return next(new CustomError(10003));
    }
    try {
      const result = await core.verifySignature(address, payload, signature);
      return res.status(200).json({
        data: {
          result: result,
        }
      });
    } catch (error) {
      logger.error(error);
      if (error instanceof CustomError) {
        return next(error);
      }
      /* istanbul ignore next */
      return res.status(200).json({
        data: {
          result: false,
        }
      });
    }
  },
  verifySignatures: async (req, res, next) => {
    const { signatures } = req.body;
    if (!signatures) {
      return next(new CustomError(10003));
    }
    const results = await core.verifySignatures(signatures);
    return res.status(200).json({
      data: {
        results: results,
      }
    });
  },
};