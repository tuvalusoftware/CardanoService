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
              $ref: "#/components/schemas/ListOfNfts"
            }
          }
        }
      },
    },
  },
};