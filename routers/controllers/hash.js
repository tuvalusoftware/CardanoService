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
    console.log("Hiiii", address, hash);
    try {
      await core.createNftTransaction(address, hash);
      res.json({
        result: 'true',
      });
    } catch (error) {
      console.log(error);
      res.json({
        result: error,
      });
    }
  },
  verifyHash: async (req, res, next) => {
    const { hash } = req.query;
    try {
      const result = await core.checkIfNftMinted(hash);
      res.json({
        result: `${result}`,
      });
    } catch (error) {
      console.log(error);
      res.json({
        result: error,
      });
    }
  },
  getPolicyId: async (req, res, next) => {
    res.json({
      result: core.getCurrentPolicyId(),
    });
  }
};