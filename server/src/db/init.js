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
