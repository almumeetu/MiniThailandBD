// PM2 Ecosystem Configuration for MiniThailandBD
// Use this for production deployment with PM2

module.exports = {
  apps: [
    {
      name: 'minithailandbd-store',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

// Usage:
// pm2 start ecosystem.config.js
// pm2 save
// pm2 startup
