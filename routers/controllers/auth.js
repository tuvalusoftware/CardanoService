/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

const serverConfig = require('../../config/serverConfig');
const authMiddleware = require('../middlewares/auth');

const Logger = require('../../Logger');

const logger = Logger.createWithDefaultConfig('routers:controllers:auth');

module.exports = {
    // TODO: handle later
    login(req, res, next) {
        const { username, password } = req.body;

        authMiddleware
            .generateJWToken(username, password, req)
            .then(({ accessToken }) => {
                res.cookie(serverConfig.authentication.jwt.cookieId, accessToken);
                res.json({
                    data: {
                        access_token: accessToken,
                    },
                });
            })
            .catch((err) => {
                next(err);
            });
    },
    async logout(_, res) {
        res.clearCookie(serverConfig.authentication.jwt.cookieId);
        res.json({});
    },
    ensureAuthenticated(req, res, next) {
        if (!req.cookies[serverConfig.authentication.jwt.cookieId]) return res.sendStatus(401);
        const token = req.cookies[serverConfig.authentication.jwt.cookieId];
        authMiddleware
            .verifyJWToken(token)
            .then((result) => {
                if (result.renew === true) {
                    authMiddleware
                        .regenerateJWToken(result.content)
                        .then((newToken) => {
                            req.userData = {
                                token: newToken,
                                newToken: true,
                                username: result.content.username,
                            };
                            res.cookie(serverConfig.authentication.jwt.cookieId, newToken);
                            next();
                        })
                        .catch(next);
                } else {
                    req.userData = {
                        token,
                        username: result.content.username,
                    };
                    next();
                }
            })
            .catch((err) => {
                res.clearCookie(serverConfig.authentication.jwt.cookieId);
                logger.debug('Cookie verification failed');
                res.status(401);
                next(err);
            });
    },
};
