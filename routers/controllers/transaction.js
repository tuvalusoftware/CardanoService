/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:transaction');

const { CustomError } = require('../CustomError');

module.exports = {
  submitTransaction: async (req, res, next) => {
    const { signedTransaction } = req.body;
    if (!signedTransaction) {
      return next(new CustomError(10008));
    }
    try {
      const txHash = await core.submitSignedTransaction(signedTransaction);
      return res.status(200).json({
        data: {
          txHash: txHash,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(new CustomError(10009));
    }
  }
};