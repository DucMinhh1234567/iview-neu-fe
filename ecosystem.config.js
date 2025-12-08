// PM2 config - Next.js sẽ tự động đọc từ .env.production khi NODE_ENV=production
module.exports = {
  apps: [
    {
      name: 'iview-frontend',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
        // Next.js tự động đọc .env.production
        // PORT và NEXT_PUBLIC_API_BASE_URL đã có trong .env.production
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

