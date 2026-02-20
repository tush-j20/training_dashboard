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
