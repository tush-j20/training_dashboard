# Deployment Guide

## Current Deployment Status

| Property | Value |
|----------|-------|
| **Server IP** | `13.233.162.74` |
| **App URL** | `http://13.233.162.74:3001` |
| **Health Check** | `http://13.233.162.74:3001/api/health` |
| **Region** | Mumbai (ap-south-1a) |
| **Instance Name** | training-dashboard |
| **Bundle** | nano_3_1 ($5/month, 512MB RAM) |
| **OS** | Ubuntu 22.04 LTS |
| **Node.js** | v18.20.8 |
| **Process Manager** | PM2 |
| **Deployed On** | 2026-02-20 |

---

## Security Configuration

All ports are restricted to company network CIDRs only. **No public internet access.**

### Allowed CIDRs (consolidated)
```
10.157.240.0/20, 159.127.0.0/16, 167.246.60.0/22,
35.170.216.249/32, 34.226.45.179/32, 34.233.22.33/32
```

### Open Ports
| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Company CIDRs only |
| 80 | HTTP | Company CIDRs only |
| 443 | HTTPS | Company CIDRs only |
| 3001 | App | Company CIDRs only |

---

## Deployment Steps Performed (via AWS CLI)

### Step 1: Create Lightsail Instance

```bash
# Check available bundles in Mumbai region
aws lightsail get-bundles --region ap-south-1 --query "bundles[?isActive==\`true\`].{bundleId:bundleId,name:name,price:price}"

# Create instance (nano_3_1 = $5/month, 512MB RAM)
aws lightsail create-instances \
  --instance-names training-dashboard \
  --availability-zone ap-south-1a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id nano_3_1 \
  --region ap-south-1

# Verify instance is running
aws lightsail get-instance \
  --instance-name training-dashboard \
  --region ap-south-1 \
  --query "instance.{state:state.name,publicIp:publicIpAddress}"
```

### Step 2: Configure Firewall (Restrict to Company CIDRs)

```bash
# Close default open ports
aws lightsail close-instance-public-ports \
  --instance-name training-dashboard \
  --port-info fromPort=22,toPort=22,protocol=tcp \
  --region ap-south-1

aws lightsail close-instance-public-ports \
  --instance-name training-dashboard \
  --port-info fromPort=80,toPort=80,protocol=tcp \
  --region ap-south-1

# Add firewall rules for each company CIDR (repeat for each CIDR)
aws lightsail open-instance-public-ports \
  --instance-name training-dashboard \
  --port-info "fromPort=22,toPort=22,protocol=tcp,cidrs=159.127.0.0/16" \
  --region ap-south-1

aws lightsail open-instance-public-ports \
  --instance-name training-dashboard \
  --port-info "fromPort=3001,toPort=3001,protocol=tcp,cidrs=159.127.0.0/16" \
  --region ap-south-1

# Verify firewall configuration
aws lightsail get-instance-port-states \
  --instance-name training-dashboard \
  --region ap-south-1
```

### Step 3: Download SSH Key

```bash
# Download default key pair (PowerShell)
$keyJson = aws lightsail download-default-key-pair --region ap-south-1 --output json | ConvertFrom-Json
$keyJson.privateKeyBase64 | Out-File -Encoding ascii -NoNewline -FilePath ls-key.pem

# Fix permissions (Windows)
icacls ls-key.pem /inheritance:r /grant:r "$($env:USERNAME):R"
```

### Step 4: Install Node.js on Server

```bash
ssh -i ls-key.pem ubuntu@43.205.199.64

# On server:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # v18.20.8
```

### Step 5: Clone Repository and Install Dependencies

```bash
# On server:
git clone https://github.com/tush-j20/training_dashboard.git
cd training_dashboard
git checkout main  # Default branch was 'matillion', code is on 'main'

# Install server dependencies
cd server
npm install

# Install client dependencies and build
cd ../client
npm install
npm run build
```

### Step 6: Configure Environment

```bash
# On server:
cd ~/training_dashboard/server
cp .env.example .env

# Generate secure JWT secret and set production mode
SECRET=$(openssl rand -hex 32)
sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
sed -i "s/JWT_SECRET=/JWT_SECRET=$SECRET/" .env
```

### Step 7: Install PM2 and Start Application

```bash
# On server:
sudo npm install -g pm2

cd ~/training_dashboard/server
pm2 start src/server.js --name training-dashboard
pm2 save

# Enable auto-start on reboot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 8: Verify Deployment

```bash
# On server:
pm2 status
curl http://localhost:3001/api/health
# Response: {"status":"ok","timestamp":"...","message":"Training Dashboard API is running","environment":"production"}
```

---

## Git Workflow Summary

### Initial Setup (Local Machine)

```bash
# Initialize git
git init

# Create .gitignore
# (excludes node_modules/, .env, db/*.db, dist/, build/, IDE files)

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: PRD and TODO documentation"

# Additional commits
git commit -m "Phase 0: Complete project setup"
git commit -m "Phase 0 Complete: Project setup and Hello World"

# Connect to GitHub
git remote add origin https://github.com/tush-j20/training_dashboard.git
git branch -M main
git push -u origin main
```

### Repository Structure

```
training_dashboard/
├── .gitignore
├── PRD.md                    # Product Requirements Document
├── README.md                 # Project overview
├── TODO.md                   # Implementation tasks
├── docs/
│   └── DEPLOYMENT.md         # This file
├── client/                   # React frontend
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       └── main.tsx
└── server/                   # Express backend
    ├── package.json
    ├── .env.example
    └── src/
        └── server.js
```

### Updating the Deployed Application

```bash
# From local machine - make changes and push
git add .
git commit -m "Description of changes"
git push origin main

# On server - pull and restart
ssh -i ls-key.pem ubuntu@43.205.199.64
cd ~/training_dashboard
git pull origin main
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart training-dashboard
```

---

## PM2 Commands Reference

```bash
pm2 status              # Check app status
pm2 logs                # View logs (live)
pm2 logs --lines 100    # View last 100 lines
pm2 restart all         # Restart app
pm2 stop all            # Stop app
pm2 delete all          # Remove from PM2
pm2 monit               # Real-time monitoring
```

---

## AWS CLI Commands Reference

```bash
# Instance management
aws lightsail get-instance --instance-name training-dashboard --region ap-south-1
aws lightsail start-instance --instance-name training-dashboard --region ap-south-1
aws lightsail stop-instance --instance-name training-dashboard --region ap-south-1
aws lightsail reboot-instance --instance-name training-dashboard --region ap-south-1

# Firewall management
aws lightsail get-instance-port-states --instance-name training-dashboard --region ap-south-1

# Delete instance (careful!)
aws lightsail delete-instance --instance-name training-dashboard --region ap-south-1
```

---

## Estimated Monthly Cost

| Component | Cost |
|-----------|------|
| Lightsail nano_3_1 (512MB) | $5.00 |
| Data transfer | Included (512GB) |
| Static IP (if attached) | Free while attached |
| **Total** | **~$5/month** |

---

## How to Deploy Updates

### Option 1: Using Lightsail Browser Console (Recommended)

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Select the `training-dashboard` instance
3. Click "Connect using SSH" (browser-based terminal)
4. Run the deployment script:
   ```bash
   cd ~/training_dashboard
   bash scripts/deploy.sh
   ```

### Option 2: Via SSH (requires network access)

```bash
ssh -i ls-key.pem ubuntu@43.205.199.64
cd ~/training_dashboard
git pull origin main
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart all
```

### Manual Deployment Steps

```bash
cd ~/training_dashboard
git fetch origin
git reset --hard origin/main
cd client && npm install && npm run build
cd ../server && npm install
npm run db:init  # Only if schema changed
npm run db:seed  # Only if adding seed data
pm2 restart all
```

---

## Troubleshooting

### App not accessible
- Verify you're on company network (allowed CIDRs)
- Check app is running: `pm2 status`
- Check logs: `pm2 logs`

### SSH connection refused
- Verify your IP is in allowed CIDRs
- Check AWS Lightsail firewall rules

### Port already in use
```bash
lsof -i :3001
kill -9 <PID>
pm2 restart training-dashboard
```

### App crashes on startup
```bash
pm2 logs training-dashboard --lines 50
# Check for missing dependencies or env vars
```

### Database issues
```bash
ls -la ~/training_dashboard/db/
# Should show training.db file
```

---

## SSH Key Location

The SSH key is stored locally at:
```
c:\Cursor\Training Dashboard\ls-key.pem
```

**Important:** Keep this file secure and do not commit to git.
