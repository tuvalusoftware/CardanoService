module.exports = {
  apps: [
    {
      name: "apis",
      script: "index.js",
      instances: "2",
      autorestart: true,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        PORT: 59001,
      },
    }
  ]
}