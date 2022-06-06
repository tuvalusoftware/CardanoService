module.exports = {
  post: {
    security: {
      cookieAuth: [],
    },
    tags: ["Hash"],
    description: "Verify signatures",
    operationId: "verifySignatures",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              signatures: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Signature",
                },
              },
            },
          },
        },
      },
      required: true,
      description: "Signatures",
    },
    responses: {
      200: {
        description: "List of boolean, either true or false.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: {
                        type: "boolean",
                        example: true,
                      },
                    },
                  },
                }
              }
            }
          }
        }
      }
    },
  },
};