module.exports = {
  get: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
    description: "Get current policy id",
    operationId: "getPolicyId",
    parameters: [],
    requestBody: {},
    responses: {
      200: {
        description: "PolicyId",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524",
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