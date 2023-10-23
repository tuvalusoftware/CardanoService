import * as core from "../../core";

import * as BodyValidator from "simple-body-validator";
import * as RuleValidator from "./rule";

import * as T from "../../core/transaction";
import * as H from "../../core/helpers";

import { errorTypes } from "./error.types";
import { Response } from "./response";
import { memoryCache } from "../../core/cache";

import Logger from "../../Logger";

export const HelloWorld = async (req, res, next) => {
	return res.json("HELLO_WORLD");
};

export const StoreHashRandom = async (req, res, next) => {
	Logger.info("StoreHashRandom");
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreHash);
		if (bodyValidator.validate()) {
			const { hash, did } = req.body;
			Logger.info(JSON.stringify(req.body));
			const { policy, asset, txHash, walletId } = await T.MintNFTRandom({
				assetName: hash,
				metadata: {
					name: hash,
					did: did,
					description: "Fuixlab's wrap document",
					image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
					mediaType: "image/png",
					files: [
						{
							src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
							name: hash,
							mediaType: "image/png"
						}
					],
					attach: hash,
					version: 0,
					type: "document",
				},
				options: {}
			});
			return res.json(Response({ type: "document", policy, asset, txHash, walletId }, undefined));
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const StoreHash = async (req, res, next) => {
	Logger.info("StoreHash");
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreHash);
		if (bodyValidator.validate()) {
			const { hash, did } = req.body;
			Logger.info(JSON.stringify(req.body));
			const { policy, asset, txHash } = await T.MintNFTRandom({
				assetName: hash,
				metadata: {
					name: hash,
					did: did,
					description: "Fuixlab's wrap document",
					image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
					mediaType: "image/png",
					files: [
						{
							src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
							name: hash,
							mediaType: "image/png"
						}
					],
					attach: hash,
					version: 0,
					type: "document",
				},
				options: {}
			});
			return res.json(Response({ type: "document", policy, asset, txHash }, undefined));
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const UpdateHash = async (req, res, next) => {
	Logger.info("UpdateHash");
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.UpdateHash);
		if (bodyValidator.validate()) {
			const { newHash, did, config } = req.body;
			Logger.info(JSON.stringify(req.body));

			let assetDetail = await H.getAssetDetails(config.asset);

			if (assetDetail && assetDetail.onchainMetadata) {

				const assetName = assetDetail.assetName;
				// assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
				// assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

				if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {

					const newVersion = assetDetail.onchainMetadata.version + 1;

					const { policy, asset, txHash } = await T.MintNFTRandom({
						assetName: newHash,
						metadata: {
							name: newHash,
							did: did,
							description: "Fuixlab's Wrap Document",
							image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
							mediaType: "image/png",
							files: [
								{
									src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
									name: newHash,
									mediaType: "image/png"
								}
							],
							attach: newHash,
							previous: config.asset.slice(56),
							version: newVersion,
							type: "document",
						},
						options: {
							policy: config.policy,
							asset: config.asset,
							burn: config.burn,
						},
					});

					if ((config.policy.reuse && config.policy.reuse === true && policy.id !== config.policy.id) || asset === config.asset) {
						return res.json(Response(undefined, {
							reason: errorTypes.SOMETHING_WENT_WRONG,
						}));
					}

					return res.json(Response({ type: "document", policy, asset, txHash }, undefined));

				} else {
					Logger.info("Config mismatch");
					return res.json(Response(undefined, {
						reason: errorTypes.CONFIG_MISMATCH,
					}));
				}

			} else {
				Logger.info("Could not fetch asset details or invalid NFT metadata");
				return res.json(Response(undefined, {
					reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
				}));
			}

		} else {
			Logger.info(JSON.stringify(bodyValidator.errors().all()));
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const RevokeHash = async (req, res, next) => {
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.RevokeHash);
		if (bodyValidator.validate()) {
			const { config, burnAll } = req.body;
			try {
				await T.BurnNFT({
					config: config,
					burnAll: burnAll,
				});
				return res.json(Response("SUCCESS", undefined));
			} catch (error) {
				Logger.error(error);
				return res.json(Response(undefined, {
					reason: errorTypes.BURN_NFT_FAILED,
				}));
			}
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const StoreCredentials = async (req, res, next) => {
	Logger.info("StoreCredentials");
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreCredentials);
		if (bodyValidator.validate()) {
			const { credentials, config } = req.body;

			let currIndex = 0;

			let mintedAsset = [];
			// if (memoryCache.get(`credentials-${config.policy.id}`) !== undefined) {
			// 	mintedAsset = memoryCache.get(`credentials-${config.policy.id}`);
			// } else {
			mintedAsset = await H.getMintedAssets(config.policy.id, {});
			Logger.info("mintedAsset", JSON.stringify(mintedAsset));
			if (mintedAsset.length > 0) {
				mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
					return asset?.onchainMetadata?.type == "credential";
					// return asset.onchainMetadata[asset.policyId][asset.assetName].type === "credential";
				}));
			} else {
				return res.json(Response(undefined, {
					reason: errorTypes.SOMETHING_WENT_WRONG,
				}));
			}
			// 	memoryCache.set(`credentials-${config.policy.id}`, mintedAsset, 60);
			// }

			let owner = config.asset.slice(56);

			if (config.type !== "document") {

				let assetDetail = await H.getAssetDetails(config.asset);
				if (assetDetail && assetDetail?.onchainMetadata) {

					const assetName = assetDetail?.assetName;
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

					if (assetDetail?.onchainMetadata?.policy === config?.policy?.id && assetDetail?.onchainMetadata?.ttl === config?.policy?.ttl) {
						currIndex = assetDetail?.onchainMetadata?.index + 1;
						owner = assetDetail?.onchainMetadata?.owner;
					} else {
						return res.json(Response(undefined, {
							reason: errorTypes.CONFIG_MISMATCH,
						}));
					}

					mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
						return asset?.onchainMetadata?.owner === owner;
						// return asset.onchainMetadata[asset.policyId][asset.assetName].owner === owner;
					}));

					if (mintedAsset.length === 0) {
						return res.json(Response(undefined, {
							reason: errorTypes.ONLY_DOCUMENT_CONFIG_IS_ALLOWED_BECAUSE_THIS_DOCUMENT_HAS_NOT_ANY_CREDENTAILS,
						}));
					}

				} else {
					return res.json(Response(undefined, {
						reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
					}));
				}

			}

			let metadata = {};

			for (let i = 0; i < credentials.length; ++i) {
				const credential = credentials[i];
				metadata[credential] = {
					name: credential,
					description: "Fuixlab's credential",
					image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
					mediaType: "image/png",
					files: [
						{
							src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
							name: credential,
							mediaType: "image/png"
						}
					],
					owner: owner,
					attach: credential,
					index: currIndex,
					type: "credential",
				};

				if (currIndex !== 0) {
					// metadata.previous = config.asset.slice(56);
					metadata[credential].previous = config.asset.slice(56);
				}
			}

			const { policy, asset, txHash } = await T.MintBatchNFT({
				assetNames: credentials,
				metadata: metadata,
				options: {
					policy: config?.policy,
				}
			});

			return res.json(Response({ type: "credential", policy, asset, txHash }, undefined));

		} else {
			console.log(bodyValidator.errors().all());
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const StoreCredential = async (req, res, next) => {
	Logger.info("StoreCredential");
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreCredential);
		if (bodyValidator.validate()) {
			const { credential, config } = req.body;

			let currIndex = 0;

			let mintedAsset = [];
			if (memoryCache.get(`credential-${config.policy.id}`) !== undefined) {
				mintedAsset = memoryCache.get(`credential-${config.policy.id}`);
			} else {
				mintedAsset = await H.getMintedAssets(config.policy.id, {});
				// Logger.info("mintedAsset", JSON.stringify(mintedAsset));
				if (mintedAsset.length > 0) {
					mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
						return asset?.onchainMetadata?.type == "credential";
						// return asset.onchainMetadata[asset.policyId][asset.assetName].type === "credential";
					}));
				} else {
					return res.json(Response(undefined, {
						reason: errorTypes.SOMETHING_WENT_WRONG,
					}));
				}
				memoryCache.set(`credential-${config.policy.id}`, mintedAsset, 60);
			}

			let owner = config.asset.slice(56);

			if (config.type !== "document") {

				let assetDetail = await H.getAssetDetails(config.asset);
				if (assetDetail && assetDetail.onchainMetadata) {

					const assetName = assetDetail.assetName;
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

					if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {
						currIndex = assetDetail.onchainMetadata.index + 1;
						owner = assetDetail.onchainMetadata.owner;
					} else {
						return res.json(Response(undefined, {
							reason: errorTypes.CONFIG_MISMATCH,
						}));
					}

					mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
						return asset.onchainMetadata.owner === owner;
						// return asset.onchainMetadata[asset.policyId][asset.assetName].owner === owner;
					}));

					if (mintedAsset.length === 0) {
						return res.json(Response(undefined, {
							reason: errorTypes.ONLY_DOCUMENT_CONFIG_IS_ALLOWED_BECAUSE_THIS_DOCUMENT_HAS_NOT_ANY_CREDENTAILS,
						}));
					}

				} else {
					return res.json(Response(undefined, {
						reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
					}));
				}

			}

			let metadata = {
				name: credential,
				description: "Fuixlab's credential",
				image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
				mediaType: "image/png",
				files: [
					{
						src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
						name: credential,
						mediaType: "image/png"
					}
				],
				owner: owner,
				attach: credential,
				index: currIndex,
				type: "credential",
			};

			if (currIndex !== 0) {
				metadata.previous = config.asset.slice(56);
			}

			const { policy, asset, txHash } = await T.MintNFTRandom({
				assetName: credential,
				metadata: metadata,
				options: {
					policy: config.policy,
				}
			});

			return res.json(Response({ type: "credential", policy, asset, txHash }, undefined));

		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const StoreCredentialRandom = async (req, res, next) => {
	Logger.info("StoreCredentialRandom");
	Logger.info(JSON.stringify(req.body));
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreCredential);
		if (bodyValidator.validate()) {
			const { credential, config } = req.body;

			let currIndex = 0;

			let mintedAsset = [];
			// if (memoryCache.get(`credential-${config.policy.id}`) !== undefined) {
			// 	mintedAsset = memoryCache.get(`credential-${config.policy.id}`);
			// } else {
			mintedAsset = await H.getMintedAssets(config.policy.id, {});
			if (mintedAsset.length > 0) {
				mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
					return asset?.onchainMetadata?.type == "credential";
					// return asset.onchainMetadata[asset.policyId][asset.assetName].type === "credential";
				}));
			} else {
				return res.json(Response(undefined, {
					reason: errorTypes.NOT_FOUND_ANY_NFT_WITH_GIVEN_POLICY_ID,
				}));
			}
			// 	memoryCache.set(`credential-${config.policy.id}`, mintedAsset, 60);
			// }

			let owner = config.asset.slice(56);

			// if (config.type !== "document") {
			// 	return res.json(Response(undefined, {
			// 		reason: "Only document type is allowed"
			// 	}));
			// }

			if (config.type !== "document") {

				let assetDetail = await H.getAssetDetails(config.asset);
				if (assetDetail && assetDetail.onchainMetadata) {

					const assetName = assetDetail.assetName;
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
					// assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

					if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {
						currIndex = assetDetail.onchainMetadata.index + 1;
						owner = assetDetail.onchainMetadata.owner;
					} else {
						return res.json(Response(undefined, {
							reason: errorTypes.CONFIG_MISMATCH,
						}));
					}

					mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
						return asset.onchainMetadata.owner === owner;
						// return asset.onchainMetadata[asset.policyId][asset.assetName].owner === owner;
					}));

					if (mintedAsset.length === 0) {
						return res.json(Response(undefined, {
							reason: errorTypes.ONLY_DOCUMENT_CONFIG_IS_ALLOWED_BECAUSE_THIS_DOCUMENT_HAS_NOT_ANY_CREDENTAILS,
						}));
					}

				} else {
					return res.json(Response(undefined, {
						reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
					}));
				}

			}

			let metadata = {
				name: credential,
				description: "Fuixlab's credential",
				image: "ipfs://QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
				mediaType: "image/png",
				files: [
					{
						src: "QmPnRTjGG7h8YKmVa94gyC3Yc1Xz1hf1uq4QZwgpeTq9D2",
						name: credential,
						mediaType: "image/png"
					}
				],
				owner: owner,
				attach: credential,
				index: currIndex,
				type: "credential",
			};

			if (currIndex !== 0) {
				metadata.previous = config.asset.slice(56);
			}

			const { policy, asset, txHash, walletId } = await T.MintNFTRandom({
				assetName: credential,
				metadata: metadata,
				options: {
					policy: config.policy,
				}
			});

			return res.json(Response({ type: "credential", policy, asset, txHash, walletId }, undefined));

		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const RevokeCredential = async (req, res, next) => {
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.RevokeCredential);
		if (bodyValidator.validate()) {
			const { config } = req.body;
			try {
				await T.BurnNFT({
					config: config
				});
				return res.json(Response("SUCCESS", undefined));
			} catch (error) {
				Logger.error(error);
				return res.json(Response(undefined, {
					reason: errorTypes.NFT_BURN_FAILED,
				}));
			}
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const FetchNFT = async (req, res, next) => {
	try {
		const filterBy = req.body;
		if (filterBy.asset) {
			const response = await core.fetchNFTByAsset(filterBy.asset);
			return res.json(Response(response || {}, undefined));
		} else if (filterBy.policyId) {
			const response = await core.fetchNFTByPolicyId(filterBy.policyId);
			return res.json(Response(response || [], undefined));
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};

export const VerifySignature = async (req, res, next) => {
	try {
		const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.VerifySignature);
		if (bodyValidator.validate()) {
			const { address, payload, signature, key } = req.body;
			const response = core.verifySignature(address, payload, { signature, key });
			return res.json(Response(response, undefined));
		} else {
			return res.json(Response(undefined, {
				reason: errorTypes.INVALID_BODY,
				data: bodyValidator.errors().all(),
			}));
		}
	} catch (error) {
		Logger.error(error);
		return res.json(Response(undefined, error));
	}
};