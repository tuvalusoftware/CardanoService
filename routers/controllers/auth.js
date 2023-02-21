import { errorTypes } from "./error.types";
import { Response } from "./response";

import axios from "axios";
import { C, getAddressDetails, networkToId } from "lucid-cardano";

import * as L from "../../core/lucid";

function isValidNetworkId(address, lucid) {
	const addressDetails = getAddressDetails(address);
	const expectedNetworkId = networkToId(lucid.network);
	if (addressDetails.networkId !== expectedNetworkId) {
		throw new Error(`Invalid address: Expected address with network id ${expectedNetworkId}, but got ${addressDetails.networkId}`);
	}
}

export const ensureAuthenticated = (req, res, next) => {
	if (process.env.ENVIRONMENT === "develop") {
		return next();
	}
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
		var data = response.data.data;
		data.network = data.network || "Cardano";
		if (data.network !== "Cardano") {
			return res.json(Response(undefined, {
				reason: errorTypes.WRONG_NETWORK,
			}))
		}
		try {
			isValidNetworkId(data.address, L.lucid);
		} catch (error) {
			return res.json(Response(undefined, error));
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