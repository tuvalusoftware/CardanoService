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
 *           description: USER_WALLET
 *       summary: Query an utxo.
 *       operationId: getUtxo
 *       description: |
 *         This API to query an utxo belongs to address.
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
 *                     example: { }
 *         '401':
 *           $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:address', utxoController.get);

module.exports = router;
