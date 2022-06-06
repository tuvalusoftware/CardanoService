module.exports = {
  get: {
    tags: ["Metadata"],
    description: "Fetch metadata",
    operationId: "getMetadata",
    parameters: [
      {
        name: "label",
        in: "path",
        schema: {
          $ref: "#/components/schemas/Label",
        },
        required: true,
        description: "Metadata Label",
      },
    ],
    responses: {
      200: {
        description: "List of Metadata",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    metadata: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Metadata"
                      },
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