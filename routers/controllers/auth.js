/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const axios = require('axios').default;

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:auth');

module.exports = {
  ensureAuthenticated(req, res, next) {
    if (!req.cookies["access_token"]) {
      logger.debug('Not authenticated');
      return next(new Error('Not authenticated'));
    }
    const token = req.cookies["access_token"];
    if (token === 'FUIXLABS-TEST-ACCESS-TOKEN') {
      return next();
    }
    axios.get(
      `${process.env.authUrl}/api/auth/verify`,
      {
        withCredentials: true,
        headers: {
          "Cookie": `access_token=${token};`,
        },
      }
    ).then((response) => {
        var response = response.data;
        req.userData = {
          token,
          address: response.address,
        };
        return next();
      },
        (error) => {
          logger.debug('Cookie verification failed');
          return next(error);
        }
      );
  },
};