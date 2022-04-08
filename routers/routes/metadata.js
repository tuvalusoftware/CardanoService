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
 *           example: "5bd530e619d81f25fb9f2a4c7ec717c546aca23a871ab9e82adc11f30a542dcc"
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
 *             "addr_test1qqhmep6w4yecfvteu29ts8409l046rkeqxhttdfmq0vrq9kpptnd5df38fpks85s00aenq39s5u7f7lnpp6d6phu38dsqjxn0h"
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
 *             description: "This is my NFT",
 *             image: "ipfs://QmSFRoaft8NP5c5nJ3Di5BaWg2XNDFVMzqBYaJRFuEpmN1"
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
 *             "addr_test1qzt9txrm7u6ewn78vypm64x9am6tw509r2lrtz2jz025ku2ftmhkntlq4m6xwl7hkc6nkx2vssqv7nknr9mne5vh6awq3nvmaa",
 *             "addr_test1qz2lp0c76dzu9xzfccjswsa50fvkc3uke4g0edzxp0xfkjcpvn7l9mxf7y706xawgux0umw8x5x56397u2m3a7xjawsqzu4vuv"
 *           ]
 *         amounts:
 *           type: array
 *           items:
 *             type: integer
 *           example: [
 *             1,
 *             2
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
 *       This API to create a metadata.
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
 *                     example: { tx_hash: "" }
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
 *       This API to update a metadata.
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
 *                     example: { tx_hash: "" }
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
 *                 example: ""
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
 *       Returns a list of metadatas from `list of addresses`.
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
 *                     example: []
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
