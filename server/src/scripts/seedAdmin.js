const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const { User, sequelize } = require('../models');

/**
 * Database-Driven Administrator Seeder
 * Creates or updates the administrator account in the 'users' table.
 */
async function seedAdmin() {
  try {
    await sequelize.authenticate();
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect().toUpperCase() : 'DATABASE';
    console.log(`Connected to ${dialect} database.`);
    await sequelize.sync({ force: false });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@edumart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'securePassword123';

    let admin = await User.findOne({ where: { email: adminEmail } });

    if (admin) {
      let updated = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      if (!admin.is_verified) {
        admin.is_verified = true;
        updated = true;
      }
      if (!admin.is_active) {
        admin.is_active = true;
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log(`Updated user ${adminEmail} in database to active administrator.`);
      } else {
        console.log(`Admin user ${adminEmail} already exists in database with active 'admin' role.`);
      }
    } else {
      admin = await User.create({
        email: adminEmail,
        password_hash: adminPassword, // Model hook automatically bcrypt hashes this
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        institution: 'EduMart Headquarters',
        is_verified: true,
        is_active: true
      });
      console.log(`Successfully created administrator in database: ${adminEmail}`);
    }

    console.log('\n==========================================');
    console.log('   EduMart Administrator Credentials');
    console.log('==========================================');
    console.log(`Email:     ${adminEmail}`);
    console.log(`Password:  ${adminPassword}`);
    console.log(`Role:      admin`);
    console.log('Login URL: http://localhost:3000/login');
    console.log('Admin URL: http://localhost:3000/admin');
    console.log('==========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin into database:', error.message);
    process.exit(1);
  }
}

seedAdmin();
