requirements:

- node
- npm install pm2 -g

# Start all applications
pm2 start ecosystem.config.js

# Stop all
pm2 stop ecosystem.config.js

# Restart all
pm2 restart ecosystem.config.js

pm2 [list|ls|status]

I tried this, but couldn't get it right: https://github.com/jessety/pm2-installer
