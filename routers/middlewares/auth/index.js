/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');

const config = require('../../../config/serverConfig');

const TokenGenerator = require('./localTokenGenerator');

const tokenGenerator = new TokenGenerator(config, jwt);

// TODO: handle authenticate
async function authenticateUser(username, password, req) {
    return {
        username,
    };
}

async function generateJWTokenWithUserData(userData, req) {
    const accessToken = await tokenGenerator.getToken({
        username: userData.username,
        rememberMe: req.body.rememberMe,
    });
    return {
        userData,
        accessToken,
    };
}

async function generateJWToken(username, password, req) {
    const userData = await authenticateUser(username, password, req);
    return generateJWTokenWithUserData(userData, req);
}

async function regenerateJWToken(userData) {
    const accessToken = await tokenGenerator.getToken({
        username: userData.username,
        rememberMe: req.body.rememberMe,
    });
    return accessToken;
}
async function verifyJWToken(token) {
    const content = await jwt.verify(token, config.authentication.jwt.publicKey, {
        algorithms: [config.authentication.jwt.algorithm],
    });
    const result = {
        content,
        renew: false,
    };
    // Check if token is about to expire...
    let { renewBeforeExpires } = config.authentication.jwt.short;
    if (content.rememberMe) {
        renewBeforeExpires = config.authentication.jwt.long.renewBeforeExpires;
    }

    if (renewBeforeExpires > 0 && content.exp - Date.now() / 1000 < renewBeforeExpires) {
        result.renew = true;
    }
    return result;
}

module.exports = {
    verifyJWToken,
    generateJWToken,
    regenerateJWToken,
    generateJWTokenWithUserData,
};
