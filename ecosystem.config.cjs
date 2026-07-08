module.exports = {
  apps: [
    {
      name: "notendo",
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx"
    }
  ]
};