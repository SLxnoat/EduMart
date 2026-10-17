const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Product, Category, User } = require('../models');

// Auto-seed initial educational catalog data if the database is empty
const seedEducationalCatalogIfEmpty = async () => {
  try {
    const productCount = await Product.count();
    if (productCount > 0) return;

    // Check or create default tutor seller
    let tutor = await User.findOne({ where: { role: 'tutor' } });
    if (!tutor) {
      tutor = await User.create({
        email: 'vidula.tutor@edumart.lk',
        password_hash: 'Password123!',
        first_name: 'Vidula',
        last_name: 'Dissanayake',
        role: 'tutor',
        institution: 'Royal Institute Colombo',
        is_verified: true,
        is_active: true
      });
    }

    // Ensure initial categories exist
    const categoriesData = [
      { name: 'Past Papers & Marking Schemes', description: 'National and provincial examination past papers with official marking guidelines.', level: 1, sort_order: 1 },
      { name: 'Revision Guides & Short Notes', description: 'Subject summaries, mind-maps, and quick revision handbooks for exam preparation.', level: 1, sort_order: 2 },
      { name: 'Model Examination Papers', description: 'Teacher-curated model test papers and timed practice assessments.', level: 1, sort_order: 3 },
      { name: 'Video Packs & Masterclasses', description: 'Pre-recorded topic deep-dives, recorded webinars, and structured lecture series.', level: 1, sort_order: 4 },
      { name: 'Reference & Resource Books', description: 'Authoritative syllabus reference materials, diagrams, and supplementary textbooks.', level: 1, sort_order: 5 }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [record] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      categoryMap[cat.name] = record.id;
    }

    const demoProducts = [
      {
        seller_id: tutor.id,
        category_id: categoryMap['Past Papers & Marking Schemes'],
        title: 'G.C.E. A/L Combined Mathematics 2023 Past Paper with Step-by-Step Marking Scheme',
        description: 'Comprehensive solutions and marking breakdown for Pure and Applied Mathematics 2023 G.C.E. Advanced Level examination. Includes common student pitfalls, alternate methods, and marking distribution.',
        price: 750.00,
        subject: 'Combined Mathematics',
        grade_level: 'A/L Grade 13',
        exam_year: 2023,
        product_type: 'past_paper',
        format: 'digital',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Revision Guides & Short Notes'],
        title: 'G.C.E. A/L Physics Complete Revision Guide - Mechanics, Waves & Optics',
        description: 'Illustrated revision handbook containing essential equations, unit conversions, experimental setups, and structured problem walkthroughs compiled by senior national curriculum tutors.',
        price: 1450.00,
        subject: 'Physics',
        grade_level: 'A/L Grade 12-13',
        exam_year: 2024,
        product_type: 'revision_notes',
        format: 'both',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Revision Guides & Short Notes'],
        title: 'A/L Chemistry Organic Chemistry Reaction Mechanisms & Mind Maps',
        description: 'High-yield organic reaction charts, pathway summaries, reagents and conditions matrix, and structural identification techniques tailored for A/L Chemistry students.',
        price: 600.00,
        subject: 'Chemistry',
        grade_level: 'A/L Grade 13',
        exam_year: 2024,
        product_type: 'revision_notes',
        format: 'digital',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Past Papers & Marking Schemes'],
        title: 'G.C.E. A/L Biology 2022 Past Paper Model Answers & Essay Guidelines',
        description: 'Complete MCQ analysis with explanations for each distractor, structured essay marking scheme, and labeled diagram references conforming to the National Institute of Education syllabus.',
        price: 800.00,
        subject: 'Biology',
        grade_level: 'A/L Grade 13',
        exam_year: 2022,
        product_type: 'past_paper',
        format: 'digital',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Model Examination Papers'],
        title: 'G.C.E. O/L Mathematics 5 Model Examination Papers with Detailed Working',
        description: 'Standard timed examination papers targeting high-frequency geometry theorems, algebraic expressions, statistics, and graphs to build exam confidence.',
        price: 950.00,
        subject: 'Mathematics',
        grade_level: 'O/L Grade 11',
        exam_year: 2024,
        product_type: 'model_paper',
        format: 'both',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Video Packs & Masterclasses'],
        title: 'Combined Maths Applied Mathematics Statics & Dynamics Masterclass Video Series',
        description: 'Over 12 hours of high-definition video walkthroughs solving equilibrium of coplanar forces, jointed rods, friction, and projectile motions.',
        price: 2200.00,
        subject: 'Combined Mathematics',
        grade_level: 'A/L Grade 13',
        exam_year: 2024,
        product_type: 'lecture_pack',
        format: 'digital',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Reference & Resource Books'],
        title: 'A/L Resource Book - Plant Physiology & Microbial Genetics Study Handbook',
        description: 'Comprehensive supplementary guide with NIE-aligned diagrams, experimental notes, and glossary for advanced biological science students.',
        price: 1200.00,
        subject: 'Biology',
        grade_level: 'A/L Grade 12',
        exam_year: 2023,
        product_type: 'ebook',
        format: 'both',
        is_active: true,
        is_approved: true
      },
      {
        seller_id: tutor.id,
        category_id: categoryMap['Model Examination Papers'],
        title: 'G.C.E. O/L Science Term Test Preparation Papers with Chemistry & Physics Labs',
        description: '10 simulated test papers covering chemical bonding, electric circuits, organ systems, and environmental science with full answers.',
        price: 850.00,
        subject: 'Science',
        grade_level: 'O/L Grade 11',
        exam_year: 2024,
        product_type: 'model_paper',
        format: 'digital',
        is_active: true,
        is_approved: true
      }
    ];

    await Product.bulkCreate(demoProducts);
  } catch (error) {
    console.error('Error during auto-seed of educational catalog:', error.message);
  }
};

/**
 * @desc    Get all products with searching, multi-attribute filtering, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  await seedEducationalCatalogIfEmpty();

  const {
    keyword,
    search,
    category,
    category_id,
    subject,
    grade_level,
    product_type,
    format,
    exam_year,
    min_price,
    max_price,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  const where = { is_active: true };

  // Search keyword across title or description
  const searchTerm = search || keyword;
  if (searchTerm && searchTerm.trim() !== '') {
    where[Op.or] = [
      { title: { [Op.like]: `%${searchTerm.trim()}%` } },
      { description: { [Op.like]: `%${searchTerm.trim()}%` } },
      { subject: { [Op.like]: `%${searchTerm.trim()}%` } }
    ];
  }

  // Category filter (supports ID or slug/name query)
  const targetCategory = category_id || category;
  if (targetCategory && targetCategory !== 'all') {
    if (!isNaN(targetCategory)) {
      where.category_id = Number(targetCategory);
    } else {
      // Find category by name
      const foundCategory = await Category.findOne({
        where: { name: { [Op.like]: `%${targetCategory}%` } }
      });
      if (foundCategory) {
        where.category_id = foundCategory.id;
      }
    }
  }

  // Subject filter
  if (subject && subject !== 'all') {
    where.subject = { [Op.like]: `%${subject.trim()}%` };
  }

  // Grade level filter
  if (grade_level && grade_level !== 'all') {
    where.grade_level = { [Op.like]: `%${grade_level.trim()}%` };
  }

  // Product type filter
  if (product_type && product_type !== 'all') {
    where.product_type = product_type;
  }

  // Format filter (digital, physical, both)
  if (format && format !== 'all') {
    where.format = format;
  }

  // Exam year filter
  if (exam_year && exam_year !== 'all') {
    where.exam_year = Number(exam_year);
  }

  // Price range filter
  const lowPrice = minPrice !== undefined ? minPrice : min_price;
  const highPrice = maxPrice !== undefined ? maxPrice : max_price;

  if (lowPrice !== undefined && highPrice !== undefined) {
    where.price = { [Op.between]: [parseFloat(lowPrice), parseFloat(highPrice)] };
  } else if (lowPrice !== undefined) {
    where.price = { [Op.gte]: parseFloat(lowPrice) };
  } else if (highPrice !== undefined) {
    where.price = { [Op.lte]: parseFloat(highPrice) };
  }

  // Sorting
  let order = [['created_at', 'DESC']];
  if (sort === 'price_asc') {
    order = [['price', 'ASC']];
  } else if (sort === 'price_desc') {
    order = [['price', 'DESC']];
  } else if (sort === 'newest') {
    order = [['created_at', 'DESC']];
  } else if (sort === 'oldest') {
    order = [['created_at', 'ASC']];
  } else if (sort === 'title_asc') {
    order = [['title', 'ASC']];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 12);
  const offset = (pageNum - 1) * pageSize;

  const { count, rows } = await Product.findAndCountAll({
    where,
    order,
    limit: pageSize,
    offset,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'level']
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'first_name', 'last_name', 'email', 'institution']
      }
    ]
  });

  res.status(200).json({
    success: true,
    count: rows.length,
    total: count,
    totalPages: Math.ceil(count / pageSize) || 1,
    currentPage: pageNum,
    products: rows
  });
});

/**
 * @desc    Get single product by UUID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'first_name', 'last_name', 'email', 'institution']
      }
    ]
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    product
  });
});

/**
 * @desc    Get all categories for filtering & navigation
 * @route   GET /api/products/categories OR GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  await seedEducationalCatalogIfEmpty();

  const categories = await Category.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    categories
  });
});

/**
 * @desc    Create a new educational product
 * @route   POST /api/products
 * @access  Private (Tutor, Institute, Admin)
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    subject,
    grade_level,
    exam_year,
    product_type,
    format = 'digital',
    category_id
  } = req.body;

  if (!title || !description || price === undefined || !subject || !grade_level || !product_type || !category_id) {
    res.status(400);
    throw new Error('Please provide all required fields: title, description, price, subject, grade_level, product_type, category_id');
  }

  // Ensure category exists
  const category = await Category.findByPk(category_id);
  if (!category) {
    res.status(400);
    throw new Error('Invalid category ID provided');
  }

  const product = await Product.create({
    seller_id: req.user.id,
    category_id,
    title,
    description,
    price: parseFloat(price),
    subject,
    grade_level,
    exam_year: exam_year ? parseInt(exam_year, 10) : null,
    product_type,
    format,
    is_active: true,
    is_approved: true // Approved for verified tutors/admins
  });

  const createdProduct = await Product.findByPk(product.id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] }
    ]
  });

  res.status(201).json({
    success: true,
    product: createdProduct
  });
});

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private (Owner Tutor or Admin)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Ensure authorization
  if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const {
    title,
    description,
    price,
    subject,
    grade_level,
    exam_year,
    product_type,
    format,
    category_id,
    is_active
  } = req.body;

  if (title) product.title = title;
  if (description) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (subject) product.subject = subject;
  if (grade_level) product.grade_level = grade_level;
  if (exam_year !== undefined) product.exam_year = exam_year ? parseInt(exam_year, 10) : null;
  if (product_type) product.product_type = product_type;
  if (format) product.format = format;
  if (category_id) product.category_id = category_id;
  if (is_active !== undefined) product.is_active = is_active;

  await product.save();

  const updatedProduct = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] }
    ]
  });

  res.status(200).json({
    success: true,
    product: updatedProduct
  });
});

/**
 * @desc    Delete or deactivate a product
 * @route   DELETE /api/products/:id
 * @access  Private (Owner Tutor or Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Ensure authorization
  if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  await product.destroy();

  res.status(200).json({
    success: true,
    message: 'Product removed successfully'
  });
});

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  seedEducationalCatalogIfEmpty
};
