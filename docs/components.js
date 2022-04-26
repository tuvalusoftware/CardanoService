module.exports = {
  components: {
    schemas: {
      Address: {
        type: "string",
        description: "Address",
        example: "addr_test1qpfufyatxx9e349at0ltac2h7vazctw0yafwsxx4trugvl25y50u28gj3jvqskzujhmxkrz3gmwalra0ardlz00x2a6qmwuqsm",
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
            example: {
              "name": "Berry Aurelia",
              "image": "ipfs://ipfs/QmdtJ6s9Fe9kUXzUkS8TMYSusVcYhqtuoD4vVsnd2V7hBg",
              "id": 39,
              "color": "#8D2759"
            },
          },
          metadata: null
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