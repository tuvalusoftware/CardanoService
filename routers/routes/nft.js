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
 *       This API to mint an NFT.
 *     responses:
 *       '200':
 *         description: |
 *           Returns a transaction hash and an asset id.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { tx_hash: "", asset_id: "" }
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
 *             example: "7c45454f3f0ce338647db87e25fee741d544761224c6bd7145a89919.NTFERDON3"
 *           description: ASSET_ID is a string, have must be form **<POLICY_ID>.<ASSET_NAME>**
 *         - in: path
 *           name: receiver
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qzt9txrm7u6ewn78vypm64x9am6tw509r2lrtz2jz025ku2ftmhkntlq4m6xwl7hkc6nkx2vssqv7nknr9mne5vh6awq3nvmaa"
 *           description: USER_WALLET
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
 *           example: "7c45454f3f0ce338647db87e25fee741d544761224c6bd7145a89919.NTFERDON3"
 *         description: ASSET_ID is a string, have must be form <POLICY_ID>.<ASSET_NAME>
 *     summary: Fetch an NFT.
 *     operationId: fetchNFT
 *     description: |
 *       This API to fetch an NFT.
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
 *                     example: { metadata: { name: "Ferdon NFT", description: "This is my NFT", image: "ipfs://<IPFS_IMAGE>" } }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/fetch/:asset_id', nftController.fetchById);

module.exports = router;
