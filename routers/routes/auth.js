/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

/**
 * @swagger
 *  /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login
 *     operationId: userLogin
 *     description: |
 *       This API to get an access token
 *     responses:
 *       '200':
 *         description: |
 *           Returns a string, which is an access token.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - data
 *                 properties:
 *                   data:
 *                     type: object
 *                     example: { access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWl..." }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userLogin'
 *       description: Empty.
 */
router.post('/login', authController.login);

router.use(authController.ensureAuthenticated);

module.exports = router;
