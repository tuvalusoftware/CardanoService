/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const axios = require('axios').default;

const Logger = require('../../Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:auth');

const { CustomError } = require('../CustomError');

module.exports = {
  ensureAuthenticated(req, res, next) {
    if (!req.cookies["access_token"]) {
      logger.debug('Not authenticated');
      return next(new CustomError(10000));
    }
    const token = req.cookies["access_token"];
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
          if (process.env['isMocha']) {
            return next();
          }
          logger.debug(error);
          return next(new CustomError(10000));
        }
      );
  },
};