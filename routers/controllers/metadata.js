/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:metadata');

module.exports = {
  getMetadata: async (req, res, next) => {
    const { label } = req.params;
    if (!label) {
      return next(new Error('Label is required'));
    }
    try {
      const metadata = await core.getMetadataByLabel(label);
      res.status(200).json({
        data: {
          metadata: metadata,
        }
      });
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }
};