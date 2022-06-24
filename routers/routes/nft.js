/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const express = require('express');
const authControler = require('../controllers/auth');

const router = express.Router();

const nftController = require('../controllers/nft');

router.get('/getAssets/:address', nftController.getAssets);
router.get('/getNFT/:assetId', nftController.getNFT);
router.get('/getNFTs/:policyId', [authControler.ensureAuthenticated], nftController.getNFTs);

module.exports = router;