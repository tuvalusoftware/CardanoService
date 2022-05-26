/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
  getMetadata: async (req, res, next) => {
    const { label } = req.params;
    if (!label) {
      throw new Error('URL invalid');
    }
    try {
      const metadata = await core.getMetadataByLabel(label);
      res.json(metadata);
    } catch (error) {
      next(error);
    }
  }
};