/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

 const express = require('express');

 const router = express.Router();
 
 const metadataController = require('../controllers/metadata');
 
 router.get('/getMetadata/:label', metadataController.getMetadata);
 
 module.exports = router; 