/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const express = require('express');

const router = express.Router();

const nftController = require('../controllers/nft');

/**
 * @swagger
 *  /api/nft/add:
 *    post:
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - nft
 *     summary: Mint an NFT.
 *     operationId: addNFT
 *     description: |
 *       **Tested** This API to mint an NFT.
 *     responses:
 *       '200':
 *         description: |
 *           Returns a transaction hash.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { tx_hash: "d29cf9398953c0308db5ec8e5725b1a09915d64dbc0c59cd3e26a9acf789807d" }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/addNFT'
 *       description: |
 *         `metadata` is a JSON object. This is an NFT metadata. Of course, you can custom an attributes in metadata.
 *
 *         `asset_name` is a string.
 */
router.post('/add', nftController.add);

/**
 * @swagger
 * /api/nft/transfer/{asset_id}/{receiver}:
 *     get:
 *       security:
 *         - cookieAuth: []
 *       tags:
 *         - nft
 *       parameters:
 *         - in: path
 *           name: asset_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "f71f5c9fa76c96b38251b9d09d28167faa732e678f92252a0ee84254.FuixlabsNFT"
 *           description: ASSET_ID
 *         - in: path
 *           name: receiver
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qzt9txrm7u6ewn78vypm64x9am6tw509r2lrtz2jz025ku2ftmhkntlq4m6xwl7hkc6nkx2vssqv7nknr9mne5vh6awq3nvmaa"
 *           description: USER_ADDRESS
 *       summary: Transfer an NFT.
 *       operationId: transferNFT
 *       description: |
 *         This API to transfer an NFT.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a transaction hash.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { tx_hash: "" }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/transfer/:asset_id/:receiver', nftController.transferById);

/**
 * @swagger
 * /api/nft/fetch/{asset_id}:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - nft
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "f71f5c9fa76c96b38251b9d09d28167faa732e678f92252a0ee84254.FuixlabsNFT"
 *         description: ASSET_ID
 *     summary: Fetch an NFT.
 *     operationId: fetchNFT
 *     description: |
 *       **Tested** This API to fetch an NFT.
 *     responses:
 *       '200':
 *         description: |
 *           Returns an NFT metadata.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: |
 *                        { "tx_hash": "d29cf9398953c0308db5ec8e5725b1a09915d64dbc0c59cd3e26a9acf789807d", "metadata": { "721": { "f71f5c9fa76c96b38251b9d09d28167faa732e678f92252a0ee84254": { "FuixlabsNFT": { "description": "Fuixlabs Logo", "image": "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2", "name": "Fuixlabs NFT" } } } } }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/fetch/:asset_id', nftController.fetchById);

module.exports = router;
