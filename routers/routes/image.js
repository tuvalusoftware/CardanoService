/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

 const express = require('express');

 const router = express.Router();
 
 const imageController = require('../controllers/image');
 
 router.put('/storeHash', imageController.storeHash);
 router.get('/verifyHash', imageController.verifyHash);
 
 module.exports = router;