/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */
const express = require('express');

const router = express.Router();

const metadataController = require('../controllers/metadata');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: access-token
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid.
 *
 *   schemas:
 *     addMetadata:
 *       type: object
 *       required:
 *         - metadata
 *       properties:
 *         metadata:
 *           type: object
 *           example: { name: "Your name", weight: "Your weight" }
 *
 *     updateMetadata:
 *       type: object
 *       required:
 *         - new_metadata
 *         - previous_tx_hash
 *       properties:
 *         new_metadata:
 *           type: object
 *           example: { name: "New your name", weight: "New your weight" }
 *         previous_tx_hash:
 *           type: string
 *           example: "df80cd4ccb444830715d8d199b6298784d583ddc19ad0bf4892e29eeceab25c5"
 *
 *     fetchMetadata:
 *       type: object
 *       required:
 *         - addresses
 *       properties:
 *         addresses:
 *           type: array
 *           items:
 *             type: string
 *           example: [
 *             "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           ]
 *
 *     addNFT:
 *       type: object
 *       required:
 *         - metadata
 *         - asset_name
 *       properties:
 *         metadata:
 *           type: object
 *           example: {
 *             name: "Fuixlabs NFT",
 *             description: "Fuixlabs Logo",
 *             image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2"
 *           }
 *         asset_name:
 *           type: string
 *           example: "FuixlabsNFT"
 *
 *     airDrop:
 *       type: object
 *       required:
 *         - receivers
 *         - quantities
 *       properties:
 *         receivers:
 *           type: array
 *           items:
 *             type: string
 *           example: [
 *             "addr_test1qzgqqn2xksnztn7swah66fzygleeuzfea4ackw090qr0pswasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxq5s2gpc",
 *             "addr_test1qz6lvs4jjx542wre08hq480qu6rnrlzu8v2jrt0rcwqa5rkasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqz2cadp"
 *           ]
 *         quantities:
 *           type: array
 *           items:
 *             type: integer
 *           example: [
 *             1,
 *             2
 *           ]
 *
 *     getRawTransaction:
 *       type: object
 *       required:
 *         - to
 *         - amounts
 *       properties:
 *         to:
 *           type: array
 *           items:
 *             type: string
 *           example: [
 *             "addr_test1qzzw0l7qd0t0dtka6cyemd6u765svp5wen8edzzhvxs2r2xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxq5c8xm0"
 *           ]
 *         amounts:
 *           type: array
 *           items:
 *             type: integer
 *           example: [
 *             1
 *           ]
 *
 *     signedTransaction:
 *       type: object
 *       required:
 *         - signedTransaction
 *       properties:
 *         signedTransaction:
 *           type: object
 *           example: { "type": "Tx AlonzoEra", "description": "", "cborHex": "84a800818258208f3bb913a219ef2dc45a10f42655e87ceae1436d490f9f9169aff4a593e1d64f000d800181825839004ff30741ff68464e711b8acb6ec885ff86926f56cd0b1b88c120ccc4dd8214ab877306442e0604de2e516d8ad53465a0212cc10c0cb8a30c821ab246cd90a1581c9240af1f8d58795698b667e8f09e96e85508cd7339f8fbdfb62555a8a14a467569786c6162734e541a0001869a021a0002ca61031a034d2ff608000e80075820dabc19288ab3f2aa4d9ac48bc5928954e587a3bbff40a69ecbbe6e945bde39b7a10081825820d79fab855a8297f853aff8ece0b6ee6bbec995ca4f33e934512340df09b40c585840eeb4c49c5e1b058badcddb2fa09ed0e2e032c80c0844815870ce5c23ad420cecc66a69102c177df93dfc3226eb22b6098e6a4acbbb20762ccbb89d66aaf92300f5d90103a100a100a2686c6f636174696f6e6643616e74686f646e616d6568467569786c616273" }
 *
 *     userLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "admin"
 *         password:
 *           type: string
 *           example: "admin@123"
 *
 * /api/metadata/add:
 *   post:
 *    security:
 *      - cookieAuth: []
 *    tags:
 *      - metadata
 *    summary: Create Metadata.
 *    operationId: addMetadata
 *    description: |
 *       **Tested** This API to create a metadata.
 *    responses:
 *       '200':
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
 *                     example: { tx_hash: "df80cd4ccb444830715d8d199b6298784d583ddc19ad0bf4892e29eeceab25c5" }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *    requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/addMetadata'
 *       description: |
 *         `metadata` is JSON object. You can custom an attributes in metadata. Below is an example with two attributes are **name** and **weight**.
 *
 */
router.post('/add', metadataController.add);

/**
 * @swagger
 * /api/metadata/update:
 *   post:
 *    security:
 *      - cookieAuth: []
 *    tags:
 *      - metadata
 *    summary: Update Metadata.
 *    operationId: updateMetadata
 *    description: |
 *       **Tested** This API to update a metadata.
 *    responses:
 *       '200':
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
 *                     example: { tx_hash: "303d18925b83ce02acd8023498566cd552f5804b754bb4c07e2828a04be3953b" }
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *    requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_metadata
 *               - previous_tx_hash
 *             properties:
 *               new_metadata:
 *                 type: object
 *                 example: { name: "New your name", weight: "New your weight" }
 *               previous_tx_hash:
 *                 type: string
 *                 example: "df80cd4ccb444830715d8d199b6298784d583ddc19ad0bf4892e29eeceab25c5"
 *       description: |
 *         `new_metadata` is JSON object. You can custom an attributes in metadata.
 *
 *         `previous_tx_hash` is a string, which is a transaction hash.
 */
router.post('/update', metadataController.update);

/**
 * @swagger
 * /api/metadata/fetch:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - metadata
 *     summary: Fetch Metadata.
 *     operationId: fetchMetadata
 *     description: |
 *       **Tested** Returns a list of metadatas from `list of addresses`.
 *     responses:
 *       '200':
 *         description: |
 *           Returns a list of metadatas.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                     example: [ { "tx_hash": "303d18925b83ce02acd8023498566cd552f5804b754bb4c07e2828a04be3953b", "metadata": { "0": { "company": "Kukulu", "name": "Khang Tran Quoc" } } } ]
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/fetchMetadata'
 *         description: |
 *           `addresses` is a list of user address.
 */
router.post('/fetch', metadataController.fetch);

module.exports = router;
