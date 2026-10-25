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

async function seedMockData() {
  console.log('\n============================================================');
  console.log('       EduMart Complete Mock Data Database Seeder');
  console.log('============================================================\n');

  try {
    await sequelize.authenticate();
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect().toUpperCase() : 'DATABASE';
    console.log(`[1/7] Connected to ${dialect} database.`);

    // 1. Categories
    console.log('[2/7] Seeding curriculum product categories...');
    const categoriesData = [
      { id: 1, name: 'Past Papers', description: 'G.C.E. A/L and O/L official examination papers with step-by-step schemes', level: 0, sort_order: 1, is_active: true },
      { id: 2, name: 'E-books & Guides', description: 'Comprehensive subject study guides, theory handbooks, and reference textbooks', level: 0, sort_order: 2, is_active: true },
      { id: 3, name: 'Model Papers', description: 'High-yield masterclass practice papers with full marking criteria', level: 0, sort_order: 3, is_active: true },
      { id: 4, name: 'Revision Notes', description: 'Concise summary charts, mind maps, formula sheets, and short notes', level: 0, sort_order: 4, is_active: true },
      { id: 5, name: 'Lecture Packs', description: 'Recorded seminar packs, video masterclasses, and tutorial workbooks', level: 0, sort_order: 5, is_active: true },
    ];

    for (const cat of categoriesData) {
      await Category.upsert(cat);
    }

    // 2. Verified Accounts
    console.log('[3/7] Seeding verified user accounts (Admin, Tutor, Student)...');
    const defaultPassword = process.env.ADMIN_PASSWORD || 'securePassword123';

    // Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@edumart.com';
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await User.create({
        id: '11111111-1111-1111-1111-111111111111',
        email: adminEmail,
        password_hash: defaultPassword,
        first_name: 'System',
        last_name: 'Administrator',
        phone: '0112345678',
        role: 'admin',
        institution: 'EduMart Headquarters',
        is_verified: true,
        is_active: true,
      });
    }

    // Tutor
    let tutor = await User.findOne({ where: { email: 'tutor@edumart.com' } });
    if (!tutor) {
      tutor = await User.create({
        id: '22222222-2222-2222-2222-222222222222',
        email: 'tutor@edumart.com',
        password_hash: defaultPassword,
        first_name: 'Vidula',
        last_name: 'Perera',
        phone: '0771234567',
        role: 'tutor',
        institution: 'Royal College Colombo',
        is_verified: true,
        is_active: true,
      });
    }

    // Student
    let student = await User.findOne({ where: { email: 'student@edumart.com' } });
    if (!student) {
      student = await User.create({
        id: '33333333-3333-3333-3333-333333333333',
        email: 'student@edumart.com',
        password_hash: defaultPassword,
        first_name: 'Charuka',
        last_name: 'Silva',
        phone: '0777654321',
        role: 'student',
        institution: 'Ananda College Colombo',
        is_verified: true,
        is_active: true,
      });
    }

    // 3. Educational Products
    console.log('[4/7] Seeding comprehensive educational mock catalog...');
    const productsData = [
      {
        id: 'a1000000-0000-0000-0000-000000000001',
        seller_id: tutor.id,
        category_id: 1,
        title: 'G.C.E. A/L Combined Mathematics 2023 Past Paper with Step-by-Step Marking Scheme',
        description: 'Comprehensive analysis of Pure and Applied Mathematics 2023 exam papers with full teacher explanations, alternative problem-solving techniques, and common error breakdowns.',
        short_description: 'Official 2023 Combined Maths past paper with full marking breakdown.',
        price: 750.00,
        original_price: 950.00,
        sku: 'EDM-MATH-AL-2023',
        subject: 'Combined Mathematics',
        grade_level: 'A/L Grade 13',
        exam_year: 2023,
        product_type: 'past_paper',
        format: 'digital',
        is_downloadable: true,
        is_shippable: false,
        file_size: 14200,
        pages: 84,
        stock_quantity: 999,
        rating_average: 4.90,
        rating_count: 28,
        is_featured: true,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000002',
        seller_id: tutor.id,
        category_id: 2,
        title: 'G.C.E. A/L Physics Complete Revision Guide - Mechanics, Waves & Optics',
        description: 'In-depth textbook covering fundamental physical mechanics, wave theory, rotational dynamics, and geometric optics with worked numerical problems and SI unit guides.',
        short_description: 'Complete A/L Physics theory handbook covering Mechanics & Optics.',
        price: 1450.00,
        original_price: 1800.00,
        sku: 'EDM-PHY-REV-2024',
        subject: 'Physics',
        grade_level: 'A/L Grade 12-13',
        exam_year: 2024,
        product_type: 'ebook',
        format: 'both',
        is_downloadable: true,
        is_shippable: true,
        file_size: 28500,
        pages: 216,
        stock_quantity: 45,
        rating_average: 4.85,
        rating_count: 36,
        is_featured: true,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000003',
        seller_id: tutor.id,
        category_id: 4,
        title: 'A/L Chemistry Organic Reaction Mechanisms & Mind Maps',
        description: 'Visual organic chemistry roadmaps covering aliphatic conversions, electrophilic additions, benzene derivatives, and carbon-carbon synthesis shortcuts.',
        short_description: 'High-speed organic chemistry synthesis summary charts.',
        price: 600.00,
        original_price: 800.00,
        sku: 'EDM-CHEM-ORG-2024',
        subject: 'Chemistry',
        grade_level: 'A/L Grade 13',
        exam_year: 2024,
        product_type: 'revision_notes',
        format: 'digital',
        is_downloadable: true,
        is_shippable: false,
        file_size: 8900,
        pages: 52,
        stock_quantity: 999,
        rating_average: 4.95,
        rating_count: 42,
        is_featured: true,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000004',
        seller_id: tutor.id,
        category_id: 3,
        title: 'G.C.E. A/L Biology 2024 Model Answers & Structured Essay Guidelines',
        description: 'Resource book compliant model essays on molecular genetics, human physiology, recombinant DNA biotechnology, and plant water relations with mark allocation points.',
        short_description: 'A/L Biology model essays with exact marking criteria.',
        price: 800.00,
        original_price: 1000.00,
        sku: 'EDM-BIO-MOD-2024',
        subject: 'Biology',
        grade_level: 'A/L Grade 13',
        exam_year: 2024,
        product_type: 'model_paper',
        format: 'digital',
        is_downloadable: true,
        is_shippable: false,
        file_size: 11200,
        pages: 68,
        stock_quantity: 999,
        rating_average: 4.80,
        rating_count: 19,
        is_featured: false,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000005',
        seller_id: tutor.id,
        category_id: 3,
        title: 'G.C.E. O/L Mathematics 5 Model Examination Papers with Detailed Working',
        description: 'Essential practice papers tailored for G.C.E. Ordinary Level candidates covering quadratic functions, geometric proofs, sets, statistics, and trigonometry with step-by-step answers.',
        short_description: '5 G.C.E. O/L Mathematics model examination papers.',
        price: 950.00,
        original_price: 1200.00,
        sku: 'EDM-MATH-OL-2024',
        subject: 'Mathematics',
        grade_level: 'O/L Grade 11',
        exam_year: 2024,
        product_type: 'model_paper',
        format: 'both',
        is_downloadable: true,
        is_shippable: true,
        file_size: 16800,
        pages: 110,
        stock_quantity: 60,
        rating_average: 4.75,
        rating_count: 22,
        is_featured: true,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000006',
        seller_id: tutor.id,
        category_id: 5,
        title: 'Combined Maths Applied Mathematics Statics & Dynamics Masterclass Video Series',
        description: 'Complete video lecture pack accompanied by PDF exercise sheets covering planar forces, centers of gravity, friction laws, circular motion, and simple harmonic motion.',
        short_description: 'Statics & Dynamics video masterclasses with workbook.',
        price: 2200.00,
        original_price: 2800.00,
        sku: 'EDM-MATH-VID-2024',
        subject: 'Combined Mathematics',
        grade_level: 'A/L Grade 13',
        exam_year: 2024,
        product_type: 'lecture_pack',
        format: 'digital',
        is_downloadable: true,
        is_shippable: false,
        file_size: 45000,
        pages: 140,
        stock_quantity: 999,
        rating_average: 4.92,
        rating_count: 31,
        is_featured: true,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000007',
        seller_id: tutor.id,
        category_id: 2,
        title: 'A/L Resource Book - Plant Physiology & Microbial Genetics Study Handbook',
        description: 'Authoritative study handbook aligned with the National Institute of Education (NIE) syllabus covering photosynthesis, nitrogen metabolism, and bacterial conjugation.',
        short_description: 'NIE syllabus handbook on Plant Physiology and Microbial Genetics.',
        price: 1200.00,
        original_price: 1500.00,
        sku: 'EDM-BIO-RES-2024',
        subject: 'Biology',
        grade_level: 'A/L Grade 12',
        exam_year: 2023,
        product_type: 'ebook',
        format: 'both',
        is_downloadable: true,
        is_shippable: true,
        file_size: 19400,
        pages: 160,
        stock_quantity: 35,
        rating_average: 4.88,
        rating_count: 14,
        is_featured: false,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
      {
        id: 'a1000000-0000-0000-0000-000000000008',
        seller_id: tutor.id,
        category_id: 1,
        title: 'G.C.E. O/L Science Term Test Preparation Papers with Chemistry & Physics Labs',
        description: 'Comprehensive science test package including experimental chemistry reaction guides, ray diagram sheets, electric circuits, and biology classification charts.',
        short_description: 'O/L Science term test preparation package with laboratory guides.',
        price: 850.00,
        original_price: 1100.00,
        sku: 'EDM-SCI-OL-2024',
        subject: 'Science',
        grade_level: 'O/L Grade 11',
        exam_year: 2024,
        product_type: 'past_paper',
        format: 'digital',
        is_downloadable: true,
        is_shippable: false,
        file_size: 13500,
        pages: 96,
        stock_quantity: 999,
        rating_average: 4.70,
        rating_count: 18,
        is_featured: false,
        is_active: true,
        is_approved: true,
        approved_at: new Date(),
        approved_by: admin.id,
      },
    ];

    for (const p of productsData) {
      await Product.upsert(p);
    }

    // 4. Coupons
    console.log('[5/7] Seeding active discount coupons...');
    const couponsData = [
      {
        code: 'EDUMART10',
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase: 0,
        max_discount: 1000,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usage_limit: 1000,
        used_count: 5,
        is_active: true,
      },
      {
        code: 'WELCOME20',
        discount_type: 'percentage',
        discount_value: 20,
        min_purchase: 1000,
        max_discount: 1500,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usage_limit: 500,
        used_count: 2,
        is_active: true,
      },
      {
        code: 'LEARN50',
        discount_type: 'fixed',
        discount_value: 250,
        min_purchase: 1200,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usage_limit: 250,
        used_count: 1,
        is_active: true,
      },
    ];

    for (const c of couponsData) {
      await Coupon.upsert(c);
    }

    // 5. Digital Assets & Preview files
    console.log('[6/7] Seeding digital assets and document previews...');
    const digitalAssetsData = [
      {
        id: 'd1000000-0000-0000-0000-000000000001',
        product_id: 'a1000000-0000-0000-0000-000000000001',
        file_name: 'AL_Combined_Maths_2023_PastPaper_Scheme.pdf',
        file_path: '/uploads/materials/maths_2023.pdf',
        file_size: 14200,
        mime_type: 'application/pdf',
        is_preview: false,
        download_count: 124,
      },
      {
        id: 'd1000000-0000-0000-0000-000000000002',
        product_id: 'a1000000-0000-0000-0000-000000000001',
        file_name: 'AL_Combined_Maths_2023_Sample_Preview.pdf',
        file_path: '/uploads/materials/maths_2023_preview.pdf',
        file_size: 1500,
        mime_type: 'application/pdf',
        is_preview: true,
        download_count: 480,
      },
      {
        id: 'd1000000-0000-0000-0000-000000000003',
        product_id: 'a1000000-0000-0000-0000-000000000003',
        file_name: 'AL_Chemistry_Organic_MindMaps_2024.pdf',
        file_path: '/uploads/materials/chem_organic_2024.pdf',
        file_size: 8900,
        mime_type: 'application/pdf',
        is_preview: false,
        download_count: 312,
      },
      {
        id: 'd1000000-0000-0000-0000-000000000004',
        product_id: 'a1000000-0000-0000-0000-000000000004',
        file_name: 'AL_Biology_Model_Essays_2024.pdf',
        file_path: '/uploads/materials/bio_essays_2024.pdf',
        file_size: 11200,
        mime_type: 'application/pdf',
        is_preview: false,
        download_count: 89,
      },
    ];

    for (const d of digitalAssetsData) {
      await DigitalAsset.upsert(d);
    }

    // 6. Reviews & Sample Orders
    console.log('[7/7] Seeding student reviews and sample order transactions...');
    const reviewsData = [
      {
        id: 'r1000000-0000-0000-0000-000000000001',
        product_id: 'a1000000-0000-0000-0000-000000000001',
        user_id: student.id,
        rating: 5,
        title: 'Outstanding marking breakdown!',
        comment: 'The step-by-step marking scheme helped clarify exactly how marks are given for integration and vectors. Very clear explanations.',
        is_verified_purchase: true,
        helpful_votes: 12,
        is_approved: true,
      },
      {
        id: 'r1000000-0000-0000-0000-000000000002',
        product_id: 'a1000000-0000-0000-0000-000000000002',
        user_id: student.id,
        rating: 5,
        title: 'Complete mechanics guide with great diagrams',
        comment: 'Clear explanations of circular motion and rotational dynamics. Highly recommended for any A/L physical science student.',
        is_verified_purchase: true,
        helpful_votes: 8,
        is_approved: true,
      },
      {
        id: 'r1000000-0000-0000-0000-000000000003',
        product_id: 'a1000000-0000-0000-0000-000000000003',
        user_id: student.id,
        rating: 5,
        title: 'Organic conversions made easy',
        comment: 'These summary mind maps saved me hours during exam revision! All major pathways in single visual maps.',
        is_verified_purchase: true,
        helpful_votes: 15,
        is_approved: true,
      },
    ];

    for (const r of reviewsData) {
      await Review.upsert(r);
    }

    // Sample Order
    const sampleOrderId = 'e1000000-0000-0000-0000-000000000001';
    await Order.upsert({
      id: sampleOrderId,
      user_id: student.id,
      order_number: 'EDM-2026-1001',
      status: 'paid',
      subtotal: 1350.00,
      tax_amount: 0.00,
      shipping_cost: 0.00,
      discount_amount: 135.00,
      coupon_code: 'EDUMART10',
      total_amount: 1215.00,
      currency: 'LKR',
      payment_status: 'paid',
      payment_method: 'credit_card',
      billing_address: {
        street: '123 Galle Road',
        city: 'Colombo',
        postalCode: '00300',
        country: 'LK',
      },
      placed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Sample Order Items
    await OrderItem.upsert({
      id: 'oi100000-0000-0000-0000-000000000001',
      order_id: sampleOrderId,
      product_id: 'a1000000-0000-0000-0000-000000000001',
      quantity: 1,
      unit_price: 750.00,
      total_price: 750.00,
      product_title: 'G.C.E. A/L Combined Mathematics 2023 Past Paper with Step-by-Step Marking Scheme',
      product_subject: 'Combined Mathematics',
      product_grade_level: 'A/L Grade 13',
      is_digital: true,
      is_physical: false,
    });

    await OrderItem.upsert({
      id: 'oi100000-0000-0000-0000-000000000002',
      order_id: sampleOrderId,
      product_id: 'a1000000-0000-0000-0000-000000000003',
      quantity: 1,
      unit_price: 600.00,
      total_price: 600.00,
      product_title: 'A/L Chemistry Organic Reaction Mechanisms & Mind Maps',
      product_subject: 'Chemistry',
      product_grade_level: 'A/L Grade 13',
      is_digital: true,
      is_physical: false,
    });

    // Sample Payment
    await Payment.upsert({
      id: 'p1000000-0000-0000-0000-000000000001',
      order_id: sampleOrderId,
      user_id: student.id,
      amount: 1215.00,
      currency: 'LKR',
      payment_method: 'credit_card',
      provider: 'stripe_mock',
      provider_payment_id: 'pi_mock_20261025_001',
      provider_fee: 35.00,
      status: 'completed',
    });

    // Seller Earnings for Tutor
    await SellerEarning.upsert({
      id: 'se100000-0000-0000-0000-000000000001',
      seller_id: tutor.id,
      order_id: sampleOrderId,
      product_id: 'a1000000-0000-0000-0000-000000000001',
      quantity: 1,
      sale_amount: 675.00,
      platform_fee: 67.50,
      payment_processing_fee: 20.00,
      currency: 'LKR',
      status: 'available',
    });

    // Notification for Student
    await Notification.upsert({
      id: 'n1000000-0000-0000-0000-000000000001',
      user_id: student.id,
      type: 'order_status',
      title: 'Order Confirmed - EDM-2026-1001',
      message: 'Your order for G.C.E. A/L Combined Mathematics 2023 Past Paper has been confirmed and is ready for download in your dashboard.',
      is_read: false,
      related_id: sampleOrderId,
    });

    // Notification for Tutor
    await Notification.upsert({
      id: 'n1000000-0000-0000-0000-000000000002',
      user_id: tutor.id,
      type: 'order_status',
      title: 'New Material Sale!',
      message: 'A student purchased your "G.C.E. A/L Combined Mathematics 2023 Past Paper". Net earnings: LKR 587.50.',
      is_read: false,
      related_id: sampleOrderId,
    });

    // Output Summary
    const [pCount, cCount, uCount, oCount, rCount, coupCount] = await Promise.all([
      Product.count(),
      Category.count(),
      User.count(),
      Order.count(),
      Review.count(),
      Coupon.count(),
    ]);

    console.log('\n============================================================');
    console.log('       EduMart Database Successfully Seeded with Mock Data!');
    console.log('============================================================');
    console.log(`  - Products:         ${pCount} educational resources`);
    console.log(`  - Categories:       ${cCount} syllabus categories`);
    console.log(`  - Users:            ${uCount} accounts (Admin, Tutor, Student)`);
    console.log(`  - Coupons:          ${coupCount} discount coupons`);
    console.log(`  - Orders:           ${oCount} sample orders with items & payment`);
    console.log(`  - Reviews:          ${rCount} student reviews`);
    console.log('------------------------------------------------------------');
    console.log('Default Accounts (Password: ' + defaultPassword + '):');
    console.log(`  * Admin:    ${adminEmail}`);
    console.log(`  * Tutor:    tutor@edumart.com`);
    console.log(`  * Student:  student@edumart.com`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Mock data seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedMockData();
}

module.exports = seedMockData;
