module.exports = {
  apps: [{
    name: 'iview-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/iview-neu/iview-neu-fe',
    env: {
      PORT: 8003,
      NODE_ENV: 'production'
    },
    error_file: '/var/log/iview-frontend-error.log',
    out_file: '/var/log/iview-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};

