/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:utils');

module.exports = {
  getProtocolParameters: async (req, res, next) => {
    try {
      const protocolParameters = await core.getLatestEpochProtocolParameters();
      res.status(200).json({
        data: {
          protocolParameters: protocolParameters,
        },
      });
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }
};