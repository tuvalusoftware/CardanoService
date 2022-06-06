module.exports = {
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      }
    },
    responses: {
      UnauthorizedError: {
        description: "Access token is missing or invalid",
      }
    },
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
            example: "00d86a5efcde8c4129755d0d43b0fd87622a260d45b33bc04140772a532d14a4e1198cebde34e68f82b94f5068de44aa580ebf66cfaaef0698",
          },
          payload: {
            type: "string",
            description: "Payload",
            example: "7b0a202020202272616e646f6d4e756d626572223a20302e393439343136373338343132363330362c0a202020202274696d657374616d70223a20313635333435313134393334380a7d",
          },
          signature: {
            type: "string",
            description: "Signature",
            example: "845869a30127045820f9042dcf90bd841cbbf5a488ce079e21845dd12113f634560aef81a3e535e0856761646472657373583900d86a5efcde8c4129755d0d43b0fd87622a260d45b33bc04140772a532d14a4e1198cebde34e68f82b94f5068de44aa580ebf66cfaaef0698a166686173686564f458957b2261646472657373223a22303064383661356566636465386334313239373535643064343362306664383736323261323630643435623333626330343134303737326135333264313461346531313938636562646533346536386638326239346635303638646534346161353830656266363663666161656630363938222c2274696d65223a313635333435313134393438337d58400538e407261c832b3340487343b3f534d98e7c183d70b155a929a37db3fe6a48525fc20d51cfcb31379b0bcb6a4cf1a36e4556f8b0180f0c0e8661d81fab2b0c",
          },
        },
      },
      Hash: {
        type: "string",
        description: "Hash",
        example: "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
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
      PolicyId: {
        type: "string",
        description: "PolicyId",
        example: "1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524",
      },
      TransactionHash: {
        type: "string",
        description: "TransactionHash",
        example: "03afe864808fbf49390976ecf2bf29b00d8228db6e4545c205457382c5647515",
      },
      Metadata: {
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
      Asset: {
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