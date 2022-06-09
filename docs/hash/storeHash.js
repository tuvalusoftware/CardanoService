module.exports = {
  put: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
    description: "Store the hash as CNFT",
    operationId: "storeHash",
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
              previousHashOfDocument: {
                type: "string",
                example: "EMPTY",
              },
            },
          },
        },
      },
      required: true,
      description: "Address and keccak256 hash (and/or previous hash). If the previous hash is empty, set previousHashOfDocument value is EMPTY.",
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
                    policyId: {
                      $ref: "#/components/schemas/PolicyId",
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