module.exports = {
  post: {
    tags: ["Hash"],
    description: "Verify signature",
    operationId: "verifySignature",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Signature",
          },
        },
      },
      required: true,
      description: "Signature",
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