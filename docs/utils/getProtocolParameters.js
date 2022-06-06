module.exports = {
  get: {
    tags: ["Utilities"],
    description: "Get protocol parameter",
    operationId: "getProtocolParameter",
    responses: {
      200: {
        description: "Procotol Parameter",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    protocolParameters: {
                      $ref: "#/components/schemas/ProtocolParameter"
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