module.exports = {
  get: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
    description: "Get policy id from the hash of document",
    operationId: "getPolicyIdFromHash",
    parameters: [
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
        description: "Policy Id",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    policyId: {
                      $ref: "#/components/schemas/PolicyId",
                    },
                  },
                },
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