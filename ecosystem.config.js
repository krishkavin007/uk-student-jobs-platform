module.exports = {
  apps: [
    {
      name: "frontend-app",
      // Explicitly point to the Next.js executable's JS file
      script: "./node_modules/next/dist/bin/next",
      // Arguments to pass to the script (e.g., 'start' for Next.js)
      args: "start",
      // Tell PM2 to use 'node' as the interpreter for the script
      interpreter: "node",
      // Crucial: Pass arguments (like 'start') directly to the script, not the interpreter
      interpreter_args: "--",
      cwd: "/var/www/vhosts/upbeat-swanson.217-154-37-86.plesk.page/httpdocs",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      listen_timeout: 50000,
      kill_timeout: 5000,
      wait_ready: true,
      env: {
        NODE_ENV: "production",
        NEXTAUTH_URL: "https://upbeat-swanson.217-154-37-86.plesk.page",
        NEXTAUTH_SECRET: "gK8$z1L#9xR^7mT!bW@3vP*sDqU&6yZ%eA+5jN=4cQ0oH",
        SESSION_SECRET: "gK8$z1L#9xR^7mT!bW@3vP*sDqU&6yZ%eA+5jN=4cQ0oH",
        DB_PASSWORD: "Nithipondati@007",
		TRUST_PROXY_HEADERS: "1", 
        // Add any other necessary environment variables here if you have more
      },
      // Optional: Add logging settings for better debugging
      error_file: "/root/.pm2/logs/frontend-app-error.log",
      out_file: "/root/.pm2/logs/frontend-app-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};