module.exports = {
  apps : [{
    name: 'rock-paper-scissor',
    script: 'app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
