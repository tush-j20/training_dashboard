# Training Dashboard - Implementation TODO

A step-by-step implementation plan. Each task is self-contained with verification steps.

**How to use this file:**
1. Work through tasks in order (top to bottom)
2. Each task has a clear action and verification step
3. Mark checkbox `[x]` when verified
4. Don't skip verification - it ensures each step works before moving on

---

## Phase 0: Project Setup & Hello World

### 0.1 Project Initialization

#### Task 0.1.1: Create project folder structure
**Action:** Create the basic folder structure for the project.

```bash
mkdir -p server/src/routes server/src/middleware server/src/utils server/src/db
mkdir -p client docs scripts db
```

**Verify:** Run `ls -la` or `dir` and confirm you see:
```
client/
db/
docs/
scripts/
server/
```
- [ ] Verified: Folder structure created

---

#### Task 0.1.2: Initialize Node.js backend project
**Action:** Initialize package.json in the server folder.

```bash
cd server
npm init -y
```

**Verify:** Check `server/package.json` exists and contains:
```json
{
  "name": "server",
  "version": "1.0.0",
  ...
}
```
- [ ] Verified: server/package.json created

---

#### Task 0.1.3: Initialize Git repository
**Action:** Initialize git in the root folder.

```bash
cd ..
git init
```

**Verify:** Run `git status` and see:
```
On branch main (or master)
No commits yet
```
- [ ] Verified: Git repository initialized

---

#### Task 0.1.4: Create .gitignore file
**Action:** Create `.gitignore` in the root folder with this content:

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Database
db/*.db
db/*.sqlite

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

**Verify:** Run `cat .gitignore` (or `type .gitignore` on Windows) and see the content above.
- [ ] Verified: .gitignore created with correct content

---

#### Task 0.1.5: Create initial README.md
**Action:** Create `README.md` in the root folder:

```markdown
# Training Dashboard

A web application for managing, tracking, and reporting on training activities.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Hosting:** AWS Lightsail

## Project Structure

```
training-dashboard/
├── client/          # React frontend
├── server/          # Node.js backend
├── db/              # SQLite database files
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## Getting Started

See setup instructions below (to be added).

## Status

🚧 Under Development
```

**Verify:** Run `cat README.md` and confirm content is present.
- [ ] Verified: README.md created

---

### 0.2 Backend Hello World

#### Task 0.2.1: Install Express.js
**Action:** Install Express in the server folder.

```bash
cd server
npm install express
```

**Verify:** Check `server/package.json` has express in dependencies:
```json
"dependencies": {
  "express": "^4.x.x"
}
```
Also verify `server/node_modules/express` folder exists.
- [ ] Verified: Express installed

---

#### Task 0.2.2: Create basic Express server
**Action:** Create `server/src/server.js`:

```javascript
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Training Dashboard API is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
```

**Verify:** File exists at `server/src/server.js`
- [ ] Verified: server.js created

---

#### Task 0.2.3: Add start script to package.json
**Action:** Update `server/package.json` scripts section:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node src/server.js"
}
```

**Verify:** Run `cat server/package.json` and confirm scripts section is updated.
- [ ] Verified: Start script added

---

#### Task 0.2.4: Test the server
**Action:** Start the server and test the health endpoint.

```bash
cd server
npm start
```

**Verify:** You should see in terminal:
```
✅ Server running on http://localhost:3001
📍 Health check: http://localhost:3001/api/health
```

Open browser to `http://localhost:3001/api/health` and see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T...",
  "message": "Training Dashboard API is running"
}
```

Press `Ctrl+C` to stop the server after verifying.
- [ ] Verified: Server runs and health endpoint returns JSON

---

#### Task 0.2.5: Install dotenv for environment variables
**Action:** Install dotenv package.

```bash
cd server
npm install dotenv
```

**Verify:** Check `server/package.json` has dotenv:
```json
"dependencies": {
  "dotenv": "^16.x.x",
  "express": "^4.x.x"
}
```
- [ ] Verified: dotenv installed

---

#### Task 0.2.6: Create .env.example file
**Action:** Create `server/.env.example`:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-change-in-production

# Database
DB_PATH=../db/training.db
```

**Verify:** File exists at `server/.env.example`
- [ ] Verified: .env.example created

---

#### Task 0.2.7: Create .env file from example
**Action:** Copy .env.example to .env:

```bash
cd server
cp .env.example .env
```

(On Windows: `copy .env.example .env`)

**Verify:** `server/.env` file exists (won't be committed to git due to .gitignore)
- [ ] Verified: .env file created

---

#### Task 0.2.8: Update server.js to use dotenv
**Action:** Update `server/src/server.js` to load environment variables:

```javascript
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Training Dashboard API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**Verify:** Run `npm start` in server folder. You should see:
```
✅ Server running on http://localhost:3001
📍 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

Health endpoint should now include `"environment": "development"`
- [ ] Verified: Environment variables working

---

### 0.3 Frontend Hello World

#### Task 0.3.1: Initialize React app with Vite
**Action:** Create React app in client folder.

```bash
cd client
npm create vite@latest . -- --template react-ts
```

When prompted, select:
- Current directory (`.`) - Yes
- Framework: React
- Variant: TypeScript

**Verify:** `client/package.json` exists with vite and react dependencies.
- [ ] Verified: React app initialized

---

#### Task 0.3.2: Install frontend dependencies
**Action:** Install npm packages.

```bash
cd client
npm install
```

**Verify:** `client/node_modules` folder exists with many packages.
- [ ] Verified: Dependencies installed

---

#### Task 0.3.3: Clean up default files
**Action:** Replace `client/src/App.tsx` with:

```tsx
function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🎓 Training Dashboard
        </h1>
        <p style={{ color: '#666' }}>
          Application is running successfully!
        </p>
      </div>
    </div>
  );
}

export default App;
```

**Verify:** File updated at `client/src/App.tsx`
- [ ] Verified: App.tsx simplified

---

#### Task 0.3.4: Delete unnecessary default files
**Action:** Remove default Vite template files:

```bash
cd client/src
rm -f App.css index.css
```

(On Windows: `del App.css index.css`)

Also update `client/src/main.tsx` to remove CSS import:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Verify:** No `App.css` or `index.css` in `client/src/`, and `main.tsx` has no CSS imports.
- [ ] Verified: Unnecessary files removed

---

#### Task 0.3.5: Test frontend runs
**Action:** Start the frontend dev server.

```bash
cd client
npm run dev
```

**Verify:** You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open browser to `http://localhost:5173` and see:
- "🎓 Training Dashboard" heading
- "Application is running successfully!" message

Press `Ctrl+C` to stop after verifying.
- [ ] Verified: Frontend runs and displays correctly

---

### 0.4 Connect Frontend & Backend

#### Task 0.4.1: Configure Vite proxy
**Action:** Update `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**Verify:** File updated at `client/vite.config.ts`
- [ ] Verified: Vite proxy configured

---

#### Task 0.4.2: Update App.tsx to fetch from API
**Action:** Update `client/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
  message: string;
  environment: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to connect to API: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🎓 Training Dashboard
        </h1>
        
        {loading && <p>Connecting to API...</p>}
        
        {error && (
          <p style={{ color: 'red' }}>❌ {error}</p>
        )}
        
        {health && (
          <div style={{ 
            background: '#e8f5e9', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              ✅ API Connected
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Status: {health.status}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Environment: {health.environment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

**Verify:** File updated at `client/src/App.tsx`
- [ ] Verified: App.tsx updated with API call

---

#### Task 0.4.3: Test full stack connection
**Action:** Run both servers and test connection.

**Terminal 1 - Start Backend:**
```bash
cd server
npm start
```
Expected output:
```
✅ Server running on http://localhost:3001
📍 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

**Verify:** Open browser to `http://localhost:5173` and see:
- "🎓 Training Dashboard" heading
- Green box with "✅ API Connected"
- Shows "Status: ok"
- Shows "Environment: development"

If you see red error message, check that backend is running on port 3001.
- [ ] Verified: Frontend successfully connects to backend API

---

### 0.5 Initial Deployment Setup

#### Task 0.5.1: Add production build script for frontend
**Action:** Verify `client/package.json` has build script (should already exist from Vite):

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

**Verify:** Run build command:
```bash
cd client
npm run build
```

Expected output:
```
vite v5.x.x building for production...
✓ xx modules transformed.
dist/index.html          x.xx kB
dist/assets/index-xxx.js x.xx kB
```

Confirm `client/dist/` folder is created with built files.
- [ ] Verified: Frontend builds for production

---

#### Task 0.5.2: Configure backend to serve frontend in production
**Action:** Update `server/src/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Training Dashboard API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**Verify:** File updated at `server/src/server.js`
- [ ] Verified: Server configured to serve frontend

---

#### Task 0.5.3: Test production mode locally
**Action:** Test the production build locally.

**Step 1:** Build frontend
```bash
cd client
npm run build
```

**Step 2:** Set production environment and start server
```bash
cd server
# On Windows PowerShell:
$env:NODE_ENV="production"; npm start

# On Mac/Linux:
NODE_ENV=production npm start
```

**Verify:** 
1. Terminal shows: `🌍 Environment: production`
2. Open browser to `http://localhost:3001` (not 5173!)
3. You should see the Training Dashboard with "✅ API Connected"

This confirms the single server can serve both API and frontend.

Stop the server with `Ctrl+C` after verifying.
- [ ] Verified: Production build works locally

---

#### Task 0.5.4: Create deployment documentation
**Action:** Create `docs/DEPLOYMENT.md`:

```markdown
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
   git clone your-repo-url
   # OR upload files via SCP
   ```

6. **Install Dependencies**
   ```bash
   cd training-dashboard/server
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

Install PM2 to keep the app running:
```bash
sudo npm install -g pm2
cd server
NODE_ENV=production pm2 start src/server.js --name training-dashboard
pm2 save
pm2 startup  # Follow instructions to auto-start on reboot
```

### Estimated Monthly Cost
- Lightsail 512MB: $3.50
- Data transfer: Usually included
- **Total: ~$3.50/month**
```

**Verify:** File exists at `docs/DEPLOYMENT.md`
- [ ] Verified: Deployment documentation created

---

#### Task 0.5.5: First Git commit
**Action:** Create the first commit with all Phase 0 work.

```bash
cd ..  # Go to project root
git add .
git status
```

**Verify:** `git status` shows all new files staged:
```
Changes to be committed:
  new file:   .gitignore
  new file:   README.md
  new file:   TODO.md
  new file:   PRD.md
  new file:   client/...
  new file:   server/...
  new file:   docs/DEPLOYMENT.md
```

Then commit:
```bash
git commit -m "Phase 0: Project setup and Hello World complete

- Initialized Node.js backend with Express
- Created React frontend with Vite + TypeScript
- Connected frontend to backend via proxy
- Added production build configuration
- Created deployment documentation"
```

**Verify:** `git log` shows your commit.
- [ ] Verified: First commit created

---

## ✅ Phase 0 Complete!

**Congratulations!** You now have:
- A working backend API (Express + Node.js)
- A working frontend (React + TypeScript + Vite)
- Frontend-backend connection working
- Production build ready
- Deployment documentation
- Git repository with first commit

**What you can do now:**
- Deploy to AWS Lightsail following `docs/DEPLOYMENT.md`
- Continue to Phase 1: Core Infrastructure

---

## Phase 1: Core Infrastructure

### 1.1 Database Setup (SQLite)

#### Task 1.1.1: Install SQLite package
**Action:** Install better-sqlite3 in the server folder.

```bash
cd server
npm install better-sqlite3
```

**Verify:** Check `server/package.json` dependencies:
```json
"dependencies": {
  "better-sqlite3": "^9.x.x",
  "dotenv": "^16.x.x",
  "express": "^4.x.x"
}
```
- [ ] Verified: better-sqlite3 installed

---

#### Task 1.1.2: Create database initialization utility
**Action:** Create `server/src/db/database.js`:

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../db/training.db');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`📁 Database connected: ${DB_PATH}`);

module.exports = db;
```

**Verify:** File exists at `server/src/db/database.js`
- [ ] Verified: Database utility created

---

#### Task 1.1.3: Create initial schema file
**Action:** Create `server/src/db/schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'head', 'manager', 'trainer')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products/Training Topics
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('client', 'internal')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  trainer_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  meeting_link TEXT,
  attendee_count INTEGER DEFAULT 0,
  actual_attendee_count INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);

-- Training-Product relationship (many-to-many)
CREATE TABLE IF NOT EXISTS training_products (
  training_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  PRIMARY KEY (training_id, product_id),
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trainings_trainer ON trainings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(start_date);
```

**Verify:** File exists at `server/src/db/schema.sql`
- [ ] Verified: Schema file created

---

#### Task 1.1.4: Create database initialization script
**Action:** Create `server/src/db/init.js`:

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./database');

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('🔧 Initializing database schema...');

try {
  db.exec(schema);
  console.log('✅ Database schema initialized successfully!');
  
  // Show created tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('📋 Tables created:');
  tables.forEach(t => console.log(`   - ${t.name}`));
  
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
}

db.close();
```

**Verify:** File exists at `server/src/db/init.js`
- [ ] Verified: Init script created

---

#### Task 1.1.5: Add database init script to package.json
**Action:** Update `server/package.json` scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node src/server.js",
  "db:init": "node src/db/init.js"
}
```

**Verify:** Run the init script:
```bash
cd server
npm run db:init
```

Expected output:
```
📁 Database connected: .../db/training.db
🔧 Initializing database schema...
✅ Database schema initialized successfully!
📋 Tables created:
   - products
   - training_products
   - trainings
   - users
```

Also verify `db/training.db` file was created.
- [ ] Verified: Database initialization works

---

#### Task 1.1.6: Update .gitignore for database
**Action:** Verify `.gitignore` already has database entries (added in Phase 0):

```
# Database
db/*.db
db/*.sqlite
```

**Verify:** Run `cat .gitignore | grep db` and see database patterns.
- [ ] Verified: Database files are gitignored

---

### 1.2 Authentication Foundation

#### Task 1.2.1: Install authentication packages
**Action:** Install JWT and bcrypt packages.

```bash
cd server
npm install jsonwebtoken bcryptjs
```

Note: Using `bcryptjs` (pure JS) instead of `bcrypt` for easier cross-platform compatibility.

**Verify:** Check `server/package.json` dependencies include:
```json
"bcryptjs": "^2.x.x",
"jsonwebtoken": "^9.x.x"
```
- [ ] Verified: Auth packages installed

---

#### Task 1.2.2: Create auth utility functions
**Action:** Create `server/src/utils/auth.js`:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Hash a password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
```

**Verify:** File exists at `server/src/utils/auth.js`
- [ ] Verified: Auth utilities created

---

#### Task 1.2.3: Create seed script for default admin
**Action:** Create `server/src/db/seed.js`:

```javascript
require('dotenv').config();
const db = require('./database');
const { hashPassword } = require('../utils/auth');

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin user
    const adminPassword = await hashPassword('admin123');
    
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `);
    
    insertUser.run('admin@training.local', adminPassword, 'Admin User', 'admin');
    console.log('✅ Default admin user created (admin@training.local / admin123)');

    // Create sample trainer
    const trainerPassword = await hashPassword('trainer123');
    insertUser.run('trainer@training.local', trainerPassword, 'Sample Trainer', 'trainer');
    console.log('✅ Sample trainer created (trainer@training.local / trainer123)');

    // Create sample products
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (name, category, description)
      VALUES (?, ?, ?)
    `);
    
    insertProduct.run('Product A', 'Core', 'Core product training');
    insertProduct.run('Product B', 'Advanced', 'Advanced product features');
    insertProduct.run('Onboarding', 'General', 'New employee onboarding');
    console.log('✅ Sample products created');

    console.log('\n🎉 Database seeding complete!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }

  db.close();
}

seed();
```

**Verify:** File exists at `server/src/db/seed.js`
- [ ] Verified: Seed script created

---

#### Task 1.2.4: Add seed script to package.json
**Action:** Update `server/package.json` scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node src/server.js",
  "db:init": "node src/db/init.js",
  "db:seed": "node src/db/seed.js",
  "db:reset": "node src/db/init.js && node src/db/seed.js"
}
```

**Verify:** Run the seed script:
```bash
cd server
npm run db:seed
```

Expected output:
```
📁 Database connected: .../db/training.db
🌱 Seeding database...
✅ Default admin user created (admin@training.local / admin123)
✅ Sample trainer created (trainer@training.local / trainer123)
✅ Sample products created

🎉 Database seeding complete!
```
- [ ] Verified: Seed script works

---

### 1.3 Auth API Endpoints

#### Task 1.3.1: Create auth routes file
**Action:** Create `server/src/routes/auth.js`:

```javascript
const express = require('express');
const db = require('../db/database');
const { verifyPassword, generateToken } = require('../utils/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires auth middleware)
 */
router.get('/me', (req, res) => {
  // This will be protected by auth middleware
  // req.user will be set by the middleware
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint exists for consistency and future session tracking
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
```

**Verify:** File exists at `server/src/routes/auth.js`
- [ ] Verified: Auth routes created

---

#### Task 1.3.2: Create auth middleware
**Action:** Create `server/src/middleware/auth.js`:

```javascript
const { verifyToken } = require('../utils/auth');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
```

**Verify:** File exists at `server/src/middleware/auth.js`
- [ ] Verified: Auth middleware created

---

#### Task 1.3.3: Update server.js with auth routes
**Action:** Update `server/src/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');

// Import middleware
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Training Dashboard API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes (login is public, /me requires auth)
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'You have access!', user: req.user });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**Verify:** File updated at `server/src/server.js`
- [ ] Verified: Server updated with auth routes

---

#### Task 1.3.4: Test login endpoint
**Action:** Test the login API with curl or a REST client.

Start the server:
```bash
cd server
npm start
```

In another terminal, test login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@training.local","password":"admin123"}'
```

**Verify:** Response should be:
```json
{
  "message": "Login successful",
  "token": "eyJhbG...(long JWT string)",
  "user": {
    "id": 1,
    "email": "admin@training.local",
    "name": "Admin User",
    "role": "admin"
  }
}
```
- [ ] Verified: Login endpoint returns token

---

#### Task 1.3.5: Test protected endpoint
**Action:** Test accessing a protected route.

First, copy the token from the login response above, then:
```bash
curl http://localhost:3001/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Verify:** Response should be:
```json
{
  "message": "You have access!",
  "user": {
    "id": 1,
    "email": "admin@training.local",
    "role": "admin",
    "name": "Admin User"
  }
}
```

Test without token:
```bash
curl http://localhost:3001/api/protected
```

Should return:
```json
{"error": "No token provided"}
```
- [ ] Verified: Protected routes require valid token

---

## ✅ Phase 1.3 Complete!

You now have working authentication! Continue with Task 1.4 for the frontend auth UI...

---

*More phases continue below... (abbreviated for space)*

---

## Progress Tracking

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Hello World | ⬜ Not Started |
| 1.1 | Database Setup | ⬜ Not Started |
| 1.2 | Auth Foundation | ⬜ Not Started |
| 1.3 | Auth API | ⬜ Not Started |
| 1.4 | Auth UI | ⬜ Not Started |
| 1.5 | User Management | ⬜ Not Started |
| 2 | Basic UI (Mocked) | ⬜ Not Started |
| 3 | Real Backend | ⬜ Not Started |
| 4 | Feedback System | ⬜ Not Started |
| 5 | Notifications | ⬜ Not Started |
| 6 | Reports | ⬜ Not Started |
| 7 | Trainer Features | ⬜ Not Started |
| 8 | Testing | ⬜ Not Started |
| 9 | CI/CD | ⬜ Not Started |
| 10 | Polish | ⬜ Not Started |

---

*Last Updated: February 20, 2026*
