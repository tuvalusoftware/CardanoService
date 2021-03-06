module.exports = {
  post: {
    tags: ["Transaction"],
    description: "Submit signed transaction",
    operationId: "submitSignedTransaction",
    parameters: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              signedTransaction: {
                type: "array",
                items: {
                  type: "array",
                  items: {
                    type: "number",
                    example: "0",
                  },
                },
              },
            },
          },
        },
      },
      required: true,
      description: "Unit8Array",
    },
    responses: {
      200: {
        description: "Transaction hash",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    txHash: {
                      $ref: "#/components/schemas/TransactionHash"
                    },
                  },
                },
              },
            }
          }
        }
      },
    },
  },
};