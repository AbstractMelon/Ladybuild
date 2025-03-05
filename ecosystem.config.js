module.exports = {
  apps: [
    {
      name: "ladybuild",
      script: "pnpm",
      args: "start",
      autorestart: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
