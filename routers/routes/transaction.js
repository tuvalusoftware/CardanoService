/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

 const express = require('express');

 const router = express.Router();
 
 const transactionController = require('../controllers/transaction');
 
 router.post('/submitTransaction', transactionController.submitTransaction);
 
 module.exports = router;