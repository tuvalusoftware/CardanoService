module.exports = {
  components: {
    schemas: {
      Address: {
        type: "string",
        description: "Address",
        example: "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur",
      },
      Signature: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Address",
            example: "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur",
          },
          payload: {
            type: "string",
            description: "Payload",
            example: "hello",
          },
          signature: {
            type: "string",
            description: "Signature",
            example: "845869a30127045820674d11e432450118d70ea78673d5e31d5cc1aec63de0ff6284784876544be3406761646472657373583901d2eb831c6cad4aba700eb35f86966fbeff19d077954430e32ce65e8da79a3abe84f4ce817fad066acc1435be2ffc6bd7dce2ec1cc6cca6cba166686173686564f44568656c6c6f5840a3b5acd99df5f3b5e4449c5a116078e9c0fcfc126a4d4e2f6a9565f40b0c77474cafd89845e768fae3f6eec0df4575fcfe7094672c8c02169d744b415c617609",
          },
        },
      },
      Hash: {
        type: "string",
        description: "Hash",
        example: "aa51202b3df8bb0a109f484b4982d70adc046d89eabddfc02df2c0a3aa3d8d7a",
      },
      Did: {
        type: "string",
        description: "DID",
        example: "did:method:companyName:documentName:hash",
      },
      Label: {
        type: "number",
        description: "Label",
        example: 0,
      },
      AssetId: {
        type: "string",
        description: "AssetId",
        example: "9cebd568ac4ad908cdd2d45a52327fc4711911054c9951b90a6033034265727279417572656c6961",
      },
      TransactionHash: {
        type: "string",
        description: "TransactionHash",
        example: "03afe864808fbf49390976ecf2bf29b00d8228db6e4545c205457382c5647515",
      },
      Metadata: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tx_hash: {
              type: "string",
              description: "Transaction hash",
              example: "24b56bec4fd88c3a6012697641960ae0203a45028a5eddb0d4f224798094548e",
            },
            json_metadata: {
              type: "object",
              description: "JSON Metadata",
              example: {
                "name": "Fuixlabs",
              },
            },
          },
        },
      },
      Asset: {
        type: "array",
        items: {
          type: "object",
          properties: {
            unit: {
              type: "string",
              description: "Asset ID",
              example: "199062e26a0ea1370249e71e6224c6541e7825a192fe42c57aa538c341616461476f6c64656e526566657272616c31363339303438343435",
            },
            quantity: {
              type: "number",
              description: "Quantity",
              example: "1",
            },
          },
        },
      },
      NFTMetadata: {
        type: "object",
        properties: {
          asset: {
            type: "string",
            description: "Asset ID",
            example: "9cebd568ac4ad908cdd2d45a52327fc4711911054c9951b90a6033034265727279417572656c6961",
          },
          policy_id: {
            type: "string",
            description: "Policy ID",
            example: "9cebd568ac4ad908cdd2d45a52327fc4711911054c9951b90a603303",
          },
          asset_name: {
            type: "string",
            description: "Policy ID",
            example: "4265727279417572656c6961",
          },
          fingerprint: {
            type: "string",
            description: "Fingerprint",
            example: "asset1s6w7et7rw5l9z5ahzc6n5dx5pdskqqcpuhpzg5",
          },
          quantity: {
            type: "number",
            description: "Quantity",
            example: "1",
          },
          initial_mint_tx_hash: {
            type: "string",
            description: "Initial mint transaction hash",
            example: "03afe864808fbf49390976ecf2bf29b00d8228db6e4545c205457382c5647515",
          },
          mint_or_burn_count: {
            type: "number",
            description: "Mint or burn count",
            example: "1",
          },
          onchain_metadata: {
            type: "object",
            description: "Onchain metadata",
            properties: {
              name: {
                type: "string",
                example: "Berry Aurelia",
              },
              image: {
                type: "string",
                example: "ipfs://ipfs/QmdtJ6s9Fe9kUXzUkS8TMYSusVcYhqtuoD4vVsnd2V7hBg",
              },
            },
          },
        },
      },
      ProtocolParameter: {
        type: "object",
        properties: {
          epoch: {
            type: "number",
            description: "Epoch",
            example: "201",
          },
          min_fee_a: {
            type: "number",
            description: "Minimum fee A",
            example: "44",
          },
          min_fee_b: {
            type: "number",
            description: "Minimum fee B",
            example: "155381",
          },
          max_block_size: {
            type: "number",
            description: "Maximum block size",
            example: "98304",
          },
          max_tx_size: {
            type: "number",
            description: "Maximum transaction size",
            example: "16384",
          },
          key_deposit: {
            type: "number",
            description: "Key deposit",
            example: "2000000",
          },
          pool_deposit: {
            type: "number",
            description: "Pool deposit",
            example: "500000000",
          },
          min_utxo: {
            type: "number",
            description: "Minimum UTXO",
            example: "34482",
          },
          latestBlock: {
            type: "object",
            description: "Latest block",
            properties: {
              slot: {
                type: "number",
                description: "Slot",
                example: "56594447",
              },
            }
          },
        },
      }
    },
  },
};