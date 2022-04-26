/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  getProtocolParameters: async (req, res, next) => {
    try {
      const protocolParameters = await core.getLatestEpochProtocolParameters();
      res.json(protocolParameters);
    } catch (error) {
      next(error);
    }
  }
};