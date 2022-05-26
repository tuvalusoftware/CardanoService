module.exports = {
  get: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
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
      },
      401: {
        $ref: "#/components/responses/UnauthorizedError",
      }
    },
  },
};