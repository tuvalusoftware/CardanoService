import * as core from "../../core";
import * as T from "../../core/transaction";
import { errorTypes } from "./error.types";
import { Response } from "./response";

import Logger from "../../Logger";

export const HelloWorld = async (req, res, next) => {
  return res.json("Hello World!");
};

export const StoreHash = async (req, res, next) => {
  try {
    const { hash } = req.body;
    if (hash && hash.length == 64) {
      const { policy, asset } = await T.MintNFT({
        assetName: hash,
        metadata: {
          attach: hash,
          version: 0,
          type: "document",
        },
        options: {}
      });
      return res.json(Response({ type: "document", policy, asset }, undefined));
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

export const UpdateHash = async (req, res, next) => {
  Logger.info("UpdateHash");
  try {
    const { newHash, config } = req.body;
    console.log(config);
    if (newHash && config && config.type === "document" && config.policy && config.asset) {

      let assetDetail = await T.getAssetDetails(config.asset);

      if (assetDetail && assetDetail.onchainMetadata) {

        const assetName = assetDetail.assetName;
        assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
        assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

        if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {

          const newVersion = assetDetail.onchainMetadata.version + 1;

          const { policy, asset } = await T.MintNFT({
            assetName: newHash,
            metadata: {
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

          if (policy.id !== config.policy.id || asset === config.asset) {
            return res.json(Response(undefined, {
              reason: errorTypes.SOMETHING_WENT_WRONG,
            }));
          }

          return res.json(Response({ type: "document", policy, asset }, undefined));

        } else {
          return res.json(Response(undefined, {
            reason: errorTypes.CONFIG_MISMATCH,
          }));
        }

      } else {
        return res.json(Response(undefined, {
          reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
        }));
      }

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

export const RevokeHash = async (req, res, next) => {
  try {
    const { config } = req.body;
    if (config && config.type === "document" && config.policy && config.asset) {
      try {
        await T.BurnNFT({
          config: config
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
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const StoreCredential = async (req, res, next) => {
  try {
    const { credential, config } = req.body;
    if (credential && credential.length == 64 && config && (config.type === "document" || config.type === "credential") && config.policy && config.asset) {

      let currIndex = 0;

      if (config.type !== "document") {

        let assetDetail = await T.getAssetDetails(config.asset);
        if (assetDetail && assetDetail.onchainMetadata) {

          const assetName = assetDetail.assetName;
          assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
          assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

          if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {
            currIndex = assetDetail.onchainMetadata.index + 1;
          } else {
            return res.json(Response(undefined, {
              reason: errorTypes.CONFIG_MISMATCH,
            }));
          }

        } else {
          return res.json(Response(undefined, {
            reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
          }));
        }

      }

      let metadata = {
        attach: credential,
        index: currIndex,
        type: "credential",
      };

      if (currIndex !== 0) {
        metadata.previous = config.asset;
      }

      const { policy, asset } = await T.MintNFT({
        assetName: credential,
        metadata: metadata,
        options: {
          policy: config.policy,
        }
      });

      return res.json(Response({ type: "credential", policy, asset }, undefined));

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

export const RevokeCredential = async (req, res, next) => {
  try {
    if (config && config.type === "credential" && config.policy && config.asset) {
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
      }));
    }
  } catch (error) {
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
    const { address, payload, signature, key } = req.body;
    if (address && payload && signature && key) {
      const response = core.verifySignature(address, payload, { signature, key });
      return res.json(Response(response, undefined));
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