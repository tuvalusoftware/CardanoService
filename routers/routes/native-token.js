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
 *        - cookieAuth: []
 *       tags:
 *        - native-tokens
 *       parameters:
 *         - in: path
 *           name: asset_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "9240af1f8d58795698b667e8f09e96e85508cd7339f8fbdfb62555a8.FuixlabsNT"
 *           description: ASSET_ID.
 *       summary: Airdrop Native Tokens.
 *       operationId: airDrop
 *       description: |
 *         **Tested** This API to airdrop Native Tokens.
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
 *                     example: { tx_hash: ["89bd67c4825fa98421ba400ebf77c623c76295282a34e37f179d9da898079b8c"] }
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
 *           `quantities` is a list of integers. Namely, this is a number of tokens will be receiving per destination address (user address).
 */
router.post('/airdrop/:asset_id', nativeTokenController.airdropById);

module.exports = router;
