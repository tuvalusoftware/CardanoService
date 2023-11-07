module.exports = {
  apps: [
    {
      name: "cardanoservice",
      script: "bun",
      args: "index.ts",
      exec_mode: "fork",
      instances: 4,
      watch: false,
      autorestart: true,
      increment_var: "PORT",
      restart_delay: 10000,
      env: {
        "PORT": 3050,
        "NODE_ENV": "development",
        "NETWORD_NAME": "preprod",
        "NETWORK_ID": 0,
        "HOLDER_MNEMONIC": "",
        "BURNER_MNEMONIC": "",
        "CHANNEL_NAME": "CardanoService"
      }
    },
    {
      name: "cardanoerrorservice",
      script: "bun",
      args: "index.ts",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      increment_var: "PORT",
      restart_delay: 10000,
      env: {
        "PORT": 3054,
        "NODE_ENV": "development",
        "NETWORD_NAME": "preprod",
        "NETWORK_ID": 0,
        "HOLDER_MNEMONIC": "",
        "BURNER_MNEMONIC": "",
        "CHANNEL_NAME": "CardanoErrorService"
      }
    },
    {
      name: "cardanocontractservice",
      script: "bun",
      args: "index.ts",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      increment_var: "PORT",
      restart_delay: 10000,
      env: {
        "PORT": 3055,
        "NODE_ENV": "development",
        "NETWORD_NAME": "preprod",
        "NETWORK_ID": 0,
        "HOLDER_MNEMONIC": "",
        "BURNER_MNEMONIC": "",
        "CHANNEL_NAME": "CardanoContractService"
      }
    },
    // {
    //   name: "cardanobalancer",
    //   script: "bun",
    //   args: "balancer.ts",
    //   exec_mode: "fork",
    //   instances: 1,
    //   watch: false,
    //   autorestart: true,
    //   increment_var: "PORT",
    //   restart_delay: 10000,
    //   env: {
    //     "PORT": 3030,
    //     "MAX_PORT": "",
    //     "NODE_ENV": "development",
    //   }
    // }
  ]
}