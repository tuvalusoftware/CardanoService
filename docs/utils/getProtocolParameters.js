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
              $ref: "#/components/schemas/ProtocolParameter"
            }
          }
        }
      }
    },
  },
};