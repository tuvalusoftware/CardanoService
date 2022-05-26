/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

 const express = require('express');

 const router = express.Router();
 
 const utilsController = require('../controllers/utils');
 
 router.get('/getProtocolParameters', utilsController.getProtocolParameters);
 
 module.exports = router;