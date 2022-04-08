/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const path = require('path');
const secret = require('../private/secret.json');
require('dotenv').config();
module.exports = {
    recoveryPhrase: secret['recovery-phrase'],
    passphrase: secret.passphrase,
    serverURI: 'http://localhost:8090/v2',
    walletId: secret.walletId,
    network: 'testnet-magic 1097911063',
    FEE_FOR_ASSET: 1500000,
    shelleyGenesisPath: process.env.shelleyGenesisPath,
    cardanoCliDir: path.join(__dirname, '../', 'cardano-cli-js-dir'),
    era: 'alonzo',
    NAME: 'fuixlabs',
};
