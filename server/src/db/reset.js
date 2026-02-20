const path = require('path');
const fs = require('fs');

// Get db path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../db/training.db');

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Deleted existing database');
}

// Run init and seed
console.log('📦 Initializing database...');
require('./init');

console.log('🌱 Seeding database...');
require('./seed');

console.log('✅ Database reset complete!');
