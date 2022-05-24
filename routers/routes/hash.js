/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

 const express = require('express');

 const router = express.Router();
 
 const hashController = require('../controllers/hash');
 
 router.put('/storeHash', hashController.storeHash);
 router.get('/verifyHash', hashController.verifyHash);
 router.get('/getPolicyId', hashController.getPolicyId);
 
 module.exports = router;