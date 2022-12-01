import { errorTypes } from "./error.types";
import { Response } from "./response";

import axios from "axios";
import { C, getAddressDetails, networkToId } from "lucid-cardano";

import * as L from "../../core/lucid";

function addressFromWithNetworkCheck(address, lucid) {
  const addressDetails = getAddressDetails(address);
  const actualNetworkId = networkToId(lucid.network);
  if (addressDetails.networkId !== actualNetworkId) {
    throw new Error(`Invalid address: Expected address with network id ${actualNetworkId}, but got ${addressDetails.networkId}`);
  }
  return C.Address.from_bech32(address);
}

export const ensureAuthenticated = (req, res, next) => {
  // return next();
  if (!req.cookies["access_token"]) {
    return res.json(Response(undefined, {
      reason: errorTypes.MISSING_ACCESS_TOKEN,
    }))
  }
  const token = req.cookies["access_token"];
  axios.get(
    `${process.env.AUTH_SERVER}/api/auth/verify`,
    {
      withCredentials: true,
      headers: {
        "Cookie": `access_token=${token};`,
      },
    }
  ).then((response) => {
    var data = response.data;
    // if (data.network != "Cardano") {
    //   return res.json(Response(undefined, {
    //     reason: errorTypes.WRONG_NETWORK,
    //   }))
    // }
    let respAddress = data.address;
    // try {
    //   respAddress = addressFromWithNetworkCheck(data.address, L.lucid);
    // } catch (error) {
    //   return res.json(Response(undefined, error));
    // }
    req.userData = {
      token,
      address: respAddress,
      // network: data.network,
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