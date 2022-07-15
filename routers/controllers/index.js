import * as core from "../../core";
import * as T from "../../core/transaction";
import * as U from "../../core/utils";
import { errorTypes } from "./error.types";
import { Response } from "./response";

export const HelloWorld = async (req, res, next) => {
  return res.json("Hello World!");
};

export const StoreHash = async (req, res, next) => {
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
};

export const UpdateHash = async (req, res, next) => {
  const { newHash, config } = req.body;
  if (newHash && config && config.type === "document" && config.policy && config.asset) {

    let assetDetail = await U.getAssetDetails(config.asset);

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
            version: newVersion,
            type: "document",
          },
          options: {
            policy: config.policy,
          },
        });

        if (policy.id !== config.policy.id || asset === config.asset) {
          console.log("Asset: ", asset);
          console.log("Policy Id: ", policy);
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
};

export const RevokeHash = async (req, res, next) => {
  const { config } = req.body;
  console.log(config);
  if (config && config.type === "document" && config.policy && config.asset) {
    try {
      await T.BurnNFT({
        config: config
      });
    } catch (error) {
      console.log(error);
      return res.json(Response(undefined, {
        reason: errorTypes.NFT_BURN_FAILED,
      }));
    }
  } else {
    return res.json(Response(undefined, {
      reason: errorTypes.INVALID_BODY,
    }));
  }
};

export const StoreCredential = async (req, res, next) => {
  const { credential } = req.body;
  if (credential && credential.length == 64) {
    const { policy, asset } = await T.MintNFT({
      assetName: credential,
      metadata: {
        timestamp: new Date().getTime(),
        attach: credential,
        version: 0,
        type: "credential",
      },
      options: {}
    });
    return res.json(Response({ type: "credential", policy, asset }, undefined));
  } else {
    return res.json(Response(undefined, {
      reason: errorTypes.INVALID_BODY,
    }));
  }
};

export const RevokeCredential = async (req, res, next) => {
  if (config && config.type === "document" && config.policy && config.asset) {
    try {
      await T.BurnNFT({
        config: config.policy
      });
    } catch (error) {
      return res.json(Response(undefined, {
        reason: errorTypes.NFT_BURN_FAILED,
      }));
    }
  } else {
    return res.json(Response(undefined, {
      reason: errorTypes.INVALID_BODY,
    }));
  }
};

export const FetchNFT = async (req, res, next) => {
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
};

export const VerifySignature = async (req, res, next) => {
  const { address, payload, signature, key } = req.body;
  if (address && payload && signature && key) {
    const response = core.verifySignature(address, payload, { signature, key });
    return res.json(Response(response, undefined));
  } else {
    return res.json(Response(undefined, {
      reason: errorTypes.INVALID_BODY,
    }));
  }
};