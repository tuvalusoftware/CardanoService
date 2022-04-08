/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const express = require('express');

const router = express.Router();

const rawTxController = require('../controllers/raw-tx');

/**
 * @swagger
 * /api/get_transfer_ada_raw_transaction/{address}:
 *     post:
 *       security:
 *        - cookieAuth: []
 *       tags:
 *        - raw-tx
 *       parameters:
 *         - in: path
 *           name: address
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           description: USER_ADDRESS
 *       summary: Get transfer ada raw transaction.
 *       operationId: getTransferAdaRawTransaction
 *       description: |
 *         This API to get transfer ada raw transaction.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a list of raw txs.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getRawTransaction'
 *         description: |
 *           `to` is a list of strings, which is list of destination addresses.
 *
 *           `amounts` is a list of integers. Namely, this is a number of adas will be receiving per destination address (user address).
 */
router.post('/get_transfer_ada_raw_transaction/:address', rawTxController.getAdaRawTx);

/**
 * @swagger
 * /api/get_transfer_token_raw_transaction/{address}/{token_address}:
 *     post:
 *       security:
 *        - cookieAuth: []
 *       tags:
 *        - raw-tx
 *       parameters:
 *         - in: path
 *           name: address
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           description: USER_ADDRESS
 *         - in: path
 *           name: token_address
 *           required: true
 *           schema:
 *             type: string
 *             example: ""
 *           description: ASSET_ID is a string, have must be form <POLICY_ID>.<ASSET_NAME>
 *       summary: Get transfer token raw transaction.
 *       operationId: getTransferTokenRawTransaction
 *       description: |
 *         This API to get transfer token raw transaction.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a list of raw txs.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getRawTransaction'
 *         description: |
 *           `to` is a list of strings, which is list of destination addresses.
 *
 *           `amounts` is a list of integers. Namely, this is a number of adas will be receiving per destination address (user address).
 */
router.post('/get_transfer_token_raw_transaction/:address/:token_address', rawTxController.getTokenRawTx);

/**
 * @swagger
 * /api/get_create_metadata_raw_transaction/{address}:
 *     post:
 *       security:
 *        - cookieAuth: []
 *       tags:
 *        - raw-tx
 *       parameters:
 *         - in: path
 *           name: address
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           description: USER_ADDRESS
 *       summary: Get transfer metadata raw transaction.
 *       operationId: getTransferMetadataRawTransaction
 *       description: |
 *         This API to get transfer metadata raw transaction.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a raw tx.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/addMetadata'
 *         description: |
 *           `metadata` is JSON object. You can custom an attributes in metadata. Below is an example with two attributes are **name** and **weight**.
 */
router.post('/get_create_metadata_raw_transaction/:address', rawTxController.getMetadataRawTx);

/**
 * @swagger
 * /api/submit_signed_transaction/{address}:
 *     post:
 *       security:
 *        - cookieAuth: []
 *       tags:
 *        - raw-tx
 *       parameters:
 *         - in: path
 *           name: address
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           description: USER_ADDRESS
 *       summary: Submit a signed transaction.
 *       operationId: submitSignedTransaction
 *       description: |
 *         This API to submit a signed transaction.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a tx hash.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/signedTransaction'
 *         description: |
 *           zzzz.
 */
router.post('/submit_signed_transaction/:address', rawTxController.submitSignedTx);

module.exports = router;
