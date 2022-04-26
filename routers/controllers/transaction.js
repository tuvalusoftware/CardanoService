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
    try {
      const tx_hash = await core.submitSignedTransaction(signedTransaction);
      res.json(tx_hash);
    } catch (error) {
      next(error);
    }
  }
};