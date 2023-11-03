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
        "HOLDER_MNEMONIC": "swear coil wheat wash glimpse ice warm kangaroo team green veteran science edge fresh vast",
        "BURNER_MNEMONIC": "salute powder tourist reward stem permit length mule phone biology fatal act",
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
        "HOLDER_MNEMONIC": "swear coil wheat wash glimpse ice warm kangaroo team green veteran science edge fresh vast",
        "BURNER_MNEMONIC": "salute powder tourist reward stem permit length mule phone biology fatal act",
        "CHANNEL_NAME": "CardanoErrorService"
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
    //     "NODE_ENV": "development",
    //   }
    // }
  ]
}