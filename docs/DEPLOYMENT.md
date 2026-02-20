# Deployment Guide

## AWS Lightsail Deployment

### Prerequisites
- AWS Account
- AWS Lightsail instance (512MB RAM minimum, ~$3.50/month)
- Node.js 18+ installed on instance

### Initial Setup

1. **Create Lightsail Instance**
   - Go to AWS Lightsail Console
   - Create instance: OS Only → Ubuntu 22.04 LTS
   - Choose $3.50/month plan (512MB)
   - Name: `training-dashboard`

2. **Configure Networking**
   - In instance settings, go to Networking
   - Add rule: Custom TCP, Port 3001 (or 80 for production)

3. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Should show v18.x.x
   ```

5. **Clone/Upload Project**
   ```bash
   git clone https://github.com/tush-j20/training_dashboard.git
   cd training_dashboard
   ```

6. **Install Dependencies**
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   npm run build
   ```

7. **Configure Environment**
   ```bash
   cd ../server
   cp .env.example .env
   nano .env  # Edit with production values
   ```
   
   Set in .env:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=generate-a-secure-random-string
   ```

8. **Start Application**
   ```bash
   NODE_ENV=production npm start
   ```

9. **Access Application**
   - Open browser: `http://your-instance-ip:3001`

### Keep Running (PM2)

Install PM2 to keep the app running after you disconnect:

```bash
sudo npm install -g pm2
cd server
pm2 start src/server.js --name training-dashboard --env production
pm2 save
pm2 startup  # Follow instructions to auto-start on reboot
```

**Useful PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs                # View logs
pm2 restart all         # Restart app
pm2 stop all            # Stop app
```

### Updating the Application

```bash
cd ~/training_dashboard
git pull origin main
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart training-dashboard
```

### SSL/HTTPS (Optional)

For HTTPS, you can use Caddy as a reverse proxy:

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

Add:
```
yourdomain.com {
    reverse_proxy localhost:3001
}
```

Then:
```bash
sudo systemctl restart caddy
```

Caddy automatically provisions SSL certificates via Let's Encrypt.

---

## Estimated Monthly Cost

| Component | Cost |
|-----------|------|
| Lightsail 512MB | $3.50 |
| Data transfer | Usually included |
| **Total** | **~$3.50/month** |

---

## Troubleshooting

**App not accessible:**
- Check firewall rules in Lightsail Networking
- Verify app is running: `pm2 status`
- Check logs: `pm2 logs`

**Port already in use:**
- Find process: `lsof -i :3001`
- Kill it: `kill -9 <PID>`

**Database issues:**
- Check DB file exists: `ls -la ../db/`
- Check permissions: `chmod 644 ../db/training.db`
