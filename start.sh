pm2 flush

pm2 stop cardanoservice
pm2 delete cardanoservice

pm2 stop cardanoerrorservice
pm2 delete cardanoerrorservice

pm2 stop cardanocontractservice
pm2 delete cardanocontractservice

pm2 start ecosystem.config.cjs && pm2 log