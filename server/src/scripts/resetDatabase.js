const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const {
  sequelize,
  User,
  Category,
  Product,
  Coupon,
  Order,
  OrderItem,
  Payment,
  Cart,
  Notification,
  Review,
  AiInteraction,
  Session,
  AdminAction,
  SellerEarning,
  DigitalAsset,
} = require('../models');

async function resetToZeroDatabase() {
  console.log('\n============================================================');
  console.log('       EduMart Pure ZERO Database Initialization');
  console.log('============================================================\n');

  try {
    await sequelize.authenticate();
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect().toUpperCase() : 'DATABASE';
    console.log(`[1/3] Connected to ${dialect} database.`);

    console.log('[2/3] Wiping all data from all tables (Zero DB)...');
    await sequelize.sync({ force: false });

    // Truncate / delete all records from every single table
    await OrderItem.destroy({ where: {}, truncate: false });
    await Payment.destroy({ where: {}, truncate: false });
    await Order.destroy({ where: {}, truncate: false });
    await Cart.destroy({ where: {}, truncate: false });
    await Review.destroy({ where: {}, truncate: false });
    await Notification.destroy({ where: {}, truncate: false });
    await AiInteraction.destroy({ where: {}, truncate: false });
    await Session.destroy({ where: {}, truncate: false });
    await AdminAction.destroy({ where: {}, truncate: false });
    await SellerEarning.destroy({ where: {}, truncate: false });
    await DigitalAsset.destroy({ where: {}, truncate: false });
    await Product.destroy({ where: {}, truncate: false });
    await Coupon.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });
    await Category.destroy({ where: {}, truncate: false });

    console.log('      Cleaned all tables. 0 products, 0 orders, 0 payments, 0 reviews.');

    // Seed standard base categories (so catalog taxonomy is ready for new products)
    const categoriesData = [
      { id: 1, name: 'Past Papers', description: 'Past examination papers and marking schemes', level: 0, sort_order: 1, is_active: true },
      { id: 2, name: 'E-books & Guides', description: 'Digital textbooks and theory guides', level: 0, sort_order: 2, is_active: true },
      { id: 3, name: 'Model Papers', description: 'Model test papers and practice assessments', level: 0, sort_order: 3, is_active: true },
      { id: 4, name: 'Revision Notes', description: 'Revision summaries and formula sheets', level: 0, sort_order: 4, is_active: true },
      { id: 5, name: 'Lecture Packs', description: 'Lecture series and masterclasses', level: 0, sort_order: 5, is_active: true },
    ];
    await Category.bulkCreate(categoriesData);

    // Seed single clean Administrator account for initial store management
    console.log('[3/3] Creating initial Administrator account for production store management...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'securePassword123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@edumart.com';

    await User.create({
      id: '11111111-1111-1111-1111-111111111111',
      email: adminEmail,
      password_hash: adminPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      institution: 'EduMart Headquarters',
      is_verified: true,
      is_active: true,
    });

    // Check row counts to verify ZERO products
    const [pCount, oCount, uCount, cCount] = await Promise.all([
      Product.count(),
      Order.count(),
      User.count(),
      Cart.count(),
    ]);

    console.log('\n============================================================');
    console.log('       EduMart Database Successfully Reset to ZERO!');
    console.log('============================================================');
    console.log(`  - Products:       ${pCount}  (ZERO PRODUCTS - Ready for your own catalog)`);
    console.log(`  - Orders:         ${oCount}  (ZERO ORDERS)`);
    console.log(`  - Carts:          ${cCount}  (ZERO CARTS)`);
    console.log(`  - Users:          ${uCount}  (1 Admin Account)`);
    console.log('------------------------------------------------------------');
    console.log('Admin Login Credentials:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     admin`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetToZeroDatabase();
}

module.exports = resetToZeroDatabase;
