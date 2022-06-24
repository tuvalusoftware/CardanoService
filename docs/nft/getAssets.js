module.exports = {
  get: {
    tags: ["Asset"],
    description: "Get assets of address",
    operationId: "getAssets",
    parameters: [
      {
        name: "address",
        in: "path",
        schema: {
          $ref: "#/components/schemas/Address",
        },
        required: true,
        description: "Address",
      },
    ],
    responses: {
      200: {
        description: "List of Assets",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    assets: {
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