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

router.put('/storeHash', [authControler.ensureAuthenticated], hashController.storeHash);
router.put('/storeCredentials', [authControler.ensureAuthenticated], hashController.storeCredentials);
router.get('/verifyHash', [authControler.ensureAuthenticated], hashController.verifyHash);
router.get('/getPolicyId', [authControler.ensureAuthenticated], hashController.getPolicyId);
router.post('/verifySignature', [authControler.ensureAuthenticated], hashController.verifySignature);
router.post('/verifySignatures', [authControler.ensureAuthenticated], hashController.verifySignatures);

module.exports = router;