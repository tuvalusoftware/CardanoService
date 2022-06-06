/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const axios = require('axios').default;

module.exports = {
  ensureAuthenticated(req, res, next) {
    if (!req.cookies["access_token"]) {
      next(new Error('Not authenticated'));
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
    )
      .then((response) => {
        var response = response.data;
        req.userData = {
          token,
          address: response.address,
        };
        next();
      },
        (error) => {
          next(error);
        }
      );
  },
};