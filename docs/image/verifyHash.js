module.exports = {
  get: {
    tags: ["Image"],
    description: "Check the hash",
    operationId: "verifyHash",
    parameters: [
      {
        name: "hash",
        in: "query",
        schema: {
          $ref: "#/components/schemas/Hash",
        },
        required: true,
        description: "Hash",
      },
    ],
    requestBody: {},
    responses: {
      200: {
        description: "True or false.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "true",
                }
              }
            }
          }
        }
      }
    },
  },
};