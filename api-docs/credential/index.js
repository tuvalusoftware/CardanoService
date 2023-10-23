export const credential = {
  "/credential": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["credential"],
      description: "STORE",
      operationId: "store-credential",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                credential: {
                  type: "string",
                  example: "",
                },
                config: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "credential",
                    },
                    policy: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "Native",
                        },
                        id: {
                          type: "string",
                          example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb8"
                        },
                        script: {
                          type: "string",
                          example: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca7f228",
                        },
                        ttl: {
                          type: "number",
                          example: 3165123112,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb811d456db211d68cc8a6eac5e293444dec669b54812e4975497d7099467335987",
                    },
                    txHash: {
                      type: "string",
                      example: "a0cb715a0edba3107ab81f9b56b7884f5ef1933f62107531318ea8c2ce1d99a9",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "Keccak256 credential hash...",
      },
      responses: {
        200: {
          description: "Response...",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "number",
                    example: 0,
                  },
                  message: {
                    type: "string",
                    example: "SUCCESS",
                  },
                  data: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        example: "document",
                      },
                      policy: {
                        type: "object",
                        properties: {
                          type: {
                            type: "string",
                            example: "Native",
                          },
                          id: {
                            type: "string",
                            example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb8"
                          },
                          script: {
                            type: "string",
                            example: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca7f228",
                          },
                          ttl: {
                            type: "number",
                            example: 3165123112,
                          }
                        }
                      },
                      asset: {
                        type: "string",
                        example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb811d456db211d68cc8a6eac5e293444dec669b54812e4975497d7099467335987",
                      },
                      txHash: {
                        type: "string",
                        example: "a0cb715a0edba3107ab81f9b56b7884f5ef1933f62107531318ea8c2ce1d99a9",
                      }
                    },
                  },
                }
              }
            }
          }
        },
        400: {
          $ref: "#/components/responses/UnauthorizedError",
        }
      },
    },

    delete: {
      security: {
        cookieAuth: [],
      },
      tags: ["credential"],
      description: "REVOKE",
      operationId: "revoke",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                config: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "credential",
                    },
                    policy: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "Native",
                        },
                        id: {
                          type: "string",
                          example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb8"
                        },
                        script: {
                          type: "string",
                          example: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca7f228",
                        },
                        ttl: {
                          type: "number",
                          example: 3165123112,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb811d456db211d68cc8a6eac5e293444dec669b54812e4975497d7099467335987",
                    },
                    txHash: {
                      type: "string",
                      example: "a0cb715a0edba3107ab81f9b56b7884f5ef1933f62107531318ea8c2ce1d99a9",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "Config...",
      },
      responses: {
        200: {
          description: "Response...",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "number",
                    example: 0,
                  },
                  message: {
                    type: "string",
                    example: "SUCCESS",
                  },
                }
              }
            }
          }
        },
        400: {
          $ref: "#/components/responses/UnauthorizedError",
        }
      },
    },
  },
  "/credentials": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["credential"],
      description: "STORE",
      operationId: "store-credentials",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                credentials: {
                  type: "array",
                  items: {
                    type: "string",
                    example: "",
                  },
                },
                config: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "credential",
                    },
                    policy: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "Native",
                        },
                        id: {
                          type: "string",
                          example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb8"
                        },
                        script: {
                          type: "string",
                          example: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca7f228",
                        },
                        ttl: {
                          type: "number",
                          example: 3165123112,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb811d456db211d68cc8a6eac5e293444dec669b54812e4975497d7099467335987",
                    },
                    txHash: {
                      type: "string",
                      example: "a0cb715a0edba3107ab81f9b56b7884f5ef1933f62107531318ea8c2ce1d99a9",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "Keccak256 credential hash...",
      },
      responses: {
        200: {
          description: "Response...",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "number",
                    example: 0,
                  },
                  message: {
                    type: "string",
                    example: "SUCCESS",
                  },
                  data: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        example: "document",
                      },
                      policy: {
                        type: "object",
                        properties: {
                          type: {
                            type: "string",
                            example: "Native",
                          },
                          id: {
                            type: "string",
                            example: "c5a4eaddd753ed6966b7de4841b0f2dac3e1d524e0b6c33cc3c40eb8"
                          },
                          script: {
                            type: "string",
                            example: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abca7f228",
                          },
                          ttl: {
                            type: "number",
                            example: 3165123112,
                          }
                        }
                      },
                      assets: {
                        type: "array",
                      },
                      txHash: {
                        type: "string",
                        example: "a0cb715a0edba3107ab81f9b56b7884f5ef1933f62107531318ea8c2ce1d99a9",
                      }
                    },
                  },
                }
              }
            }
          }
        },
        400: {
          $ref: "#/components/responses/UnauthorizedError",
        }
      },
    },
  },
}