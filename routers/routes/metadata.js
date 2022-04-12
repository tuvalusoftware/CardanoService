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
 *             "addr_test1qzt9txrm7u6ewn78vypm64x9am6tw509r2lrtz2jz025ku2ftmhkntlq4m6xwl7hkc6nkx2vssqv7nknr9mne5vh6awq3nvmaa",
 *             "addr_test1qz2lp0c76dzu9xzfccjswsa50fvkc3uke4g0edzxp0xfkjcpvn7l9mxf7y706xawgux0umw8x5x56397u2m3a7xjawsqzu4vuv"
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
 *           type: string
 *           example: "zzz"
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
