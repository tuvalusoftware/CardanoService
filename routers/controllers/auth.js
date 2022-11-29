import { errorTypes } from "./error.types";
import { Response } from "./response";

import axios from "axios";

export const ensureAuthenticated = (req, res, next) => {
  // return next();
  if (!req.cookies["access_token"]) {
    return res.json(Response(undefined, {
      reason: errorTypes.MISSING_ACCESS_TOKEN,
    }))
  }
  const token = req.cookies["access_token"];
  axios.get(
    `${process.env.AUTH_SERVER}/api/auth/v2/verify?network=Cardano`,
    {
      withCredentials: true,
      headers: {
        "Cookie": `access_token=${token};`,
      },
    }
  ).then((response) => {
    var data = response.data;
    if (data.network != "Cardano") {
      return res.json(Response(undefined, {
        reason: errorTypes.WRONG_NETWORK,
      }))
    }
    req.userData = {
      token,
      address: data.address,
      network: data.network,
    };
    return next();
  },
    (error) => {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_ACCESS_TOKEN,
      }))
    }
  );
};