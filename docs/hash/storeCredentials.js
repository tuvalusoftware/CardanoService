module.exports = {
  put: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
    description: "Store the credentials as CNFT",
    operationId: "storeCredentials",
    parameters: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              address: {
                type: "string",
                example: "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur",
              },
              hashOfDocument: {
                type: "string",
                example: "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
              },
              originPolicyId: {
                type: "string",
                example: "1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524",
              },
              indexOfCreds: {
                type: "number",
                example: 1,
              },
              credentials: {
                type: "array",
                items: {
                  type: "object",
                }
              }
            },
          },
        },
      },
      required: true,
      description: "...",
    },
    responses: {
      200: {
        description: "true or false.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    result: {
                      type: "boolean",
                      example: "true",
                    },
                    token: {
                      type: "object",
                      properties: {
                        policyId: {
                          $ref: "#/components/schemas/PolicyId",
                        },
                        assetId: {
                          $ref: "#/components/schemas/AssetId",
                        },
                      },
                    }
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