/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  submitTransaction: async (req, res, next) => {
    const { signedTransaction } = req.body;
    if (!signedTransaction) {
      res.json({
        error: 'Request body invalid',
      });
    }
    try {
      const txHash = await core.submitSignedTransaction(signedTransaction);
      res.json(txHash);
    } catch (error) {
      next(error);
    }
  }
};