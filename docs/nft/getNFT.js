module.exports = {
  get: {
    tags: ["Asset"],
    description: "Get NFT metadata",
    operationId: "getNFTMetadata",
    parameters: [
      {
        name: "assetId",
        in: "path",
        schema: {
          $ref: "#/components/schemas/AssetId",
        },
        required: true,
        description: "AssetId",
      },
    ],
    responses: {
      200: {
        description: "NFT metadata",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    nftMetadata: {
                      $ref: "#/components/schemas/NFTMetadata"
                    },
                  },
                },
              },
            },
          }
        }
      },
    },
  },
};