/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:transaction');

module.exports = {
  submitTransaction: async (req, res, next) => {
    const { signedTransaction } = req.body;
    if (!signedTransaction) {
      return next(new Error('Signed transaction is required'));
    }
    try {
      const txHash = await core.submitSignedTransaction(signedTransaction);
      res.status(200).json({
        data: {
          txHash: txHash,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }
};