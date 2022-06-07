module.exports = {
  post: {
    security: {
      cookieAuth: [],
    },
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
                  },
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