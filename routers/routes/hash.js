/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const express = require('express');
const authControler = require('../controllers/auth');

const router = express.Router();

const hashController = require('../controllers/hash');

router.put('/storeHash', hashController.storeHash);
router.get('/verifyHash', hashController.verifyHash);
router.post('/verifySignature', hashController.verifySignature);
router.post('/verifySignatures', hashController.verifySignatures);

module.exports = router;