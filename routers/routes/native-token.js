/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const express = require('express');

const router = express.Router();

const nativeTokenController = require('../controllers/native-token');

/**
 * @swagger
 * /api/native-tokens/airdrop/{asset_id}:
 *     post:
 *       security:
 *       - cookieAuth: []
 *       tags:
 *       - native-tokens
 *       parameters:
 *         - in: path
 *           name: asset_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "7c45454f3f0ce338647db87e25fee741d544761224c6bd7145a89919.NTFERDON3"
 *           description: ASSET_ID is a string, have must be form **<POLICY_ID>.<ASSET_NAME>**
 *       summary: Airdrop Native Tokens.
 *       operationId: airDrop
 *       description: |
 *         This API to airdrop Native Tokens.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a list of transaction hash.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { tx_hash: ["5bd530e619d81f25fb9f2a4c7ec717c546aca23a871ab9e82adc11f30a542dcc", "19ba88782121a967e8b801724195be16df4ccd450e8bddd2a94951e662c41cdf"] }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/airDrop'
 *         description: |
 *           `receivers` is a list of strings, which is list of destination addresses.
 *
 *           `quantities` is a list of integers. Namely, this is a number of tokens will be receiving per destination address (user wallet).
 */
router.post('/airdrop/:asset_id', nativeTokenController.airdropById);

module.exports = router;
