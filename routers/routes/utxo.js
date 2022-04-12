/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Tran Quoc Khang / tkhangf@ferdon.io
 */

const express = require('express');

const router = express.Router();

const utxoController = require('../controllers/utxo');

/**
 * @swagger
 * /api/utxo/{address}:
 *     get:
 *       security:
 *         - cookieAuth: []
 *       tags:
 *         - utxo
 *       parameters:
 *         - in: path
 *           name: address
 *           required: true
 *           schema:
 *             type: string
 *             example: "addr_test1qp8lxp6pla5yvnn3rw9vkmkgshlcdyn02mxskxugcysve3xasg22hpmnqezzupsymch9zmv2656xtgpp9nqscr9c5vxqzzfn7n"
 *           description: USER_ADDRESS.
 *       summary: Query an utxo.
 *       operationId: getUtxo
 *       description: |
 *         **Tested** This API to query an utxo belongs to address.
 *       responses:
 *         '200':
 *           description: |
 *             Returns a JSON Object.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { "utxo": [ { "txHash": "d29cf9398953c0308db5ec8e5725b1a09915d64dbc0c59cd3e26a9acf789807d", "txId": 0, "value": { "lovelace": 2999434329, "f71f5c9fa76c96b38251b9d09d28167faa732e678f92252a0ee84254.467569786c6162734e4654": 1, "undefined": null } } ] }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:address', utxoController.get);

module.exports = router;
