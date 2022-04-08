/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const constants = require('./constants');

const authRoutes = require('./routes/auth');

const utxoRoutes = require('./routes/utxo');
const metadataRoutes = require('./routes/metadata');
const nftRoutes = require('./routes/nft');
const nativeTokenRoutes = require('./routes/native-token');

const authControler = require('./controllers/auth');

module.exports = (app) => {
    app.use(`${constants.baseApi}/auth`, authRoutes);
    app.use(`${constants.baseApi}`, authControler.ensureAuthenticated);
    app.use(`${constants.baseApi}/utxo`, utxoRoutes);
    app.use(`${constants.baseApi}/metadata`, metadataRoutes);
    app.use(`${constants.baseApi}/nft`, nftRoutes);
    app.use(`${constants.baseApi}/native-tokens`, nativeTokenRoutes);
};
