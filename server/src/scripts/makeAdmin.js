const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const { User, sequelize } = require('../models');

/**
 * Promote an existing user to Administrator in the database.
 * Usage: node src/scripts/makeAdmin.js user@example.com
 */
async function makeAdmin() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('Error: Please provide the email address to promote.');
    console.log('Usage: node src/scripts/makeAdmin.js <user_email>');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email: targetEmail.trim().toLowerCase() } });

    if (!user) {
      console.error(`User with email "${targetEmail}" was not found in the database.`);
      process.exit(1);
    }

    user.role = 'admin';
    user.is_verified = true;
    user.is_active = true;
    await user.save();

    console.log(`\nSuccess! User "${user.email}" (${user.first_name} ${user.last_name}) has been updated to role 'admin' in the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Database operation failed:', error.message);
    process.exit(1);
  }
}

makeAdmin();
