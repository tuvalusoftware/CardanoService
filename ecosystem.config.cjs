module.exports = {
  apps: [
    {
      name: "cardanoservice",
      script: "bun",
      args: "index.ts",
      exec_mode: "fork",
      instances: 5,
      watch: true,
      increment_var: "PORT",
      env: {
        "PORT": 3050,
        "NODE_ENV": "development"
      }
    }
  ]
}