module.exports = {
  put: {
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
              hash: {
                type: "string",
                example: "aa51202b3df8bb0a109f484b4982d70adc046d89eabddfc02df2c0a3aa3d8d7a",
              },
            },
          },
        },
      },
      required: true,
      description: "Address and keccak256 hash.",
    },
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