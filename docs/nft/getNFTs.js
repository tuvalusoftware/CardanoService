module.exports = {
  get: {
    tags: ["Asset"],
    description: "Get list of NFTs",
    operationId: "getListOfNFTs",
    parameters: [
      {
        name: "policyId",
        in: "path",
        schema: {
          $ref: "#/components/schemas/PolicyId",
        },
        required: true,
        description: "policyId",
      },
    ],
    responses: {
      200: {
        description: "List of NFTs",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    nfts: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Asset",
                      },
                    },
                  },
                },
              },
            }
          }
        }
      },
    },
  },
};