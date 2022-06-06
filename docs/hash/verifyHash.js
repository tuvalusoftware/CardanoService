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
        name: "policyID",
        in: "query",
        schema: {
          $ref: "#/components/schemas/PolicyID",
        },
        required: true,
        description: "Policy ID",
      },
      {
        name: "hashOfDocument",
        in: "query",
        schema: {
          $ref: "#/components/schemas/Hash",
        },
        required: true,
        description: "Hash Of Document",
      },
    ],
    requestBody: {},
    responses: {
      200: {
        description: "true or false.",
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