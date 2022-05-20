/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const constants = require('./constants');
const nftRoutes = require('./routes/nft');
const metadataRoutes = require('./routes/metadata');
const utilsRoutes = require('./routes/utils');
const transactionRoutes = require('./routes/transaction');
const hashRoutes = require('./routes/hash');

module.exports = (app) => {
  app.use(`${constants.baseApi}`, nftRoutes);
  app.use(`${constants.baseApi}`, metadataRoutes);
  app.use(`${constants.baseApi}`, utilsRoutes);
  app.use(`${constants.baseApi}`, transactionRoutes);
  app.use(`${constants.baseApi}`, hashRoutes);
};