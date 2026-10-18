const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Product, Category, User, DigitalAsset } = require('../models');

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
    minRating,
    min_rating,
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

  // Rating filter
  const ratingThreshold = minRating !== undefined ? minRating : min_rating;
  if (ratingThreshold !== undefined && ratingThreshold !== 'all' && !isNaN(ratingThreshold)) {
    where.rating_average = { [Op.gte]: parseFloat(ratingThreshold) };
  }

  // Sorting
  let order = [['created_at', 'DESC']];
  if (sort === 'price_asc') {
    order = [['price', 'ASC']];
  } else if (sort === 'price_desc') {
    order = [['price', 'DESC']];
  } else if (sort === 'rating_desc') {
    order = [['rating_average', 'DESC'], ['rating_count', 'DESC']];
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

  let product;
  try {
    product = await Product.findByPk(id, {
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
        },
        {
          model: DigitalAsset,
          as: 'digitalAssets',
          attributes: ['id', 'file_name', 'file_size', 'mime_type', 'is_preview', 'download_count', 'created_at']
        }
      ]
    });
  } catch (err) {
    product = await Product.findByPk(id, {
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
  }

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
    category_id,
    stock_quantity
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
    stock_quantity: stock_quantity !== undefined && !isNaN(stock_quantity) ? parseInt(stock_quantity, 10) : (format === 'digital' ? 0 : 50),
    is_active: true,
    is_approved: true // Approved for verified tutors/admins
  });

  // Attach uploaded main study material file if present
  if (req.files && req.files.material_file && req.files.material_file.length > 0) {
    try {
      const file = req.files.material_file[0];
      await DigitalAsset.create({
        product_id: product.id,
        file_name: file.originalname,
        file_path: file.path,
        file_size: Math.max(1, Math.round(file.size / 1024)),
        mime_type: file.mimetype,
        is_preview: false,
        sort_order: 1
      });
    } catch (_) {}
  }

  // Attach uploaded curriculum sample preview file if present
  if (req.files && req.files.preview_file && req.files.preview_file.length > 0) {
    try {
      const pFile = req.files.preview_file[0];
      await DigitalAsset.create({
        product_id: product.id,
        file_name: pFile.originalname,
        file_path: pFile.path,
        file_size: Math.max(1, Math.round(pFile.size / 1024)),
        mime_type: pFile.mimetype,
        is_preview: true,
        sort_order: 0
      });
    } catch (_) {}
  }

  let createdProduct;
  try {
    createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] },
        { model: DigitalAsset, as: 'digitalAssets', attributes: ['id', 'file_name', 'file_size', 'mime_type', 'is_preview', 'download_count'] }
      ]
    });
  } catch (_) {
    createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] }
      ]
    });
  }

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
    stock_quantity,
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
  if (stock_quantity !== undefined && !isNaN(stock_quantity)) {
    product.stock_quantity = parseInt(stock_quantity, 10);
  }
  if (is_active !== undefined) product.is_active = is_active;

  await product.save();

  // Handle uploaded main study material file replacement
  if (req.files && req.files.material_file && req.files.material_file.length > 0) {
    const file = req.files.material_file[0];
    const existingAsset = await DigitalAsset.findOne({
      where: { product_id: product.id, is_preview: false }
    });
    if (existingAsset) {
      if (existingAsset.file_path && fs.existsSync(existingAsset.file_path)) {
        try { fs.unlinkSync(existingAsset.file_path); } catch (e) {}
      }
      existingAsset.file_name = file.originalname;
      existingAsset.file_path = file.path;
      existingAsset.file_size = Math.max(1, Math.round(file.size / 1024));
      existingAsset.mime_type = file.mimetype;
      await existingAsset.save();
    } else {
      await DigitalAsset.create({
        product_id: product.id,
        file_name: file.originalname,
        file_path: file.path,
        file_size: Math.max(1, Math.round(file.size / 1024)),
        mime_type: file.mimetype,
        is_preview: false,
        sort_order: 1
      });
    }
  }

  // Handle uploaded sample preview file replacement
  if (req.files && req.files.preview_file && req.files.preview_file.length > 0) {
    try {
      const pFile = req.files.preview_file[0];
      const existingPreview = await DigitalAsset.findOne({
        where: { product_id: product.id, is_preview: true }
      });
      if (existingPreview) {
        if (existingPreview.file_path && fs.existsSync(existingPreview.file_path)) {
          try { fs.unlinkSync(existingPreview.file_path); } catch (e) {}
        }
        existingPreview.file_name = pFile.originalname;
        existingPreview.file_path = pFile.path;
        existingPreview.file_size = Math.max(1, Math.round(pFile.size / 1024));
        existingPreview.mime_type = pFile.mimetype;
        await existingPreview.save();
      } else {
        await DigitalAsset.create({
          product_id: product.id,
          file_name: pFile.originalname,
          file_path: pFile.path,
          file_size: Math.max(1, Math.round(pFile.size / 1024)),
          mime_type: pFile.mimetype,
          is_preview: true,
          sort_order: 0
        });
      }
    } catch (_) {}
  }

  let updatedProduct;
  try {
    updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] },
        { model: DigitalAsset, as: 'digitalAssets', attributes: ['id', 'file_name', 'file_size', 'mime_type', 'is_preview', 'download_count'] }
      ]
    });
  } catch (_) {
    updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] }
      ]
    });
  }

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

  // Remove physical files and records
  try {
    const assets = await DigitalAsset.findAll({ where: { product_id: id } });
    for (const asset of assets) {
      if (asset.file_path && fs.existsSync(asset.file_path)) {
        try { fs.unlinkSync(asset.file_path); } catch (e) {}
      }
      await asset.destroy();
    }
  } catch (_) {}

  await product.destroy();

  res.status(200).json({
    success: true,
    message: 'Product removed successfully'
  });
});

/**
 * @desc    Get autocomplete search suggestions
 * @route   GET /api/products/suggestions
 * @access  Public
 */
const getSuggestions = asyncHandler(async (req, res) => {
  await seedEducationalCatalogIfEmpty();
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(200).json({
      success: true,
      suggestions: [
        'Combined Mathematics 2023',
        'Physics Mechanics & Waves',
        'Organic Chemistry Mind Maps',
        'Biology Model Answers',
        'G.C.E. O/L Mathematics',
        'A/L Resource Books'
      ]
    });
  }

  const query = q.trim();
  const matched = await Product.findAll({
    where: {
      is_active: true,
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { subject: { [Op.like]: `%${query}%` } }
      ]
    },
    attributes: ['id', 'title', 'subject'],
    limit: 6
  });

  const suggestions = matched.map((m) => m.title);
  res.status(200).json({
    success: true,
    suggestions: [...new Set(suggestions)]
  });
});

/**
 * @desc    Get related educational products for a material
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentProduct = await Product.findByPk(id);

  if (!currentProduct) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.findAll({
    where: {
      id: { [Op.ne]: id },
      is_active: true,
      [Op.or]: [
        { subject: currentProduct.subject },
        { category_id: currentProduct.category_id }
      ]
    },
    limit: 4,
    order: [['rating_average', 'DESC'], ['created_at', 'DESC']],
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'institution'] }
    ]
  });

  res.status(200).json({
    success: true,
    products: related
  });
});

/**
 * @desc    Get preview details for a material
 * @route   GET /api/products/:id/preview
 * @access  Public
 */
const getProductPreview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category' }
    ]
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if a custom preview asset was uploaded
  let previewAsset = null;
  try {
    previewAsset = await DigitalAsset.findOne({
      where: { product_id: id, is_preview: true }
    });
  } catch (_) {}

  const priceNum = parseFloat(product.price) || 0;
  const originalPrice = parseFloat((priceNum * 1.45).toFixed(2));

  const preview = {
    id: product.id,
    productId: product.id,
    title: product.title,
    description: product.description,
    price: priceNum,
    original_price: originalPrice,
    discount_percentage: 31,
    subject: product.subject,
    grade_level: product.grade_level,
    exam_year: product.exam_year,
    format: product.format,
    is_digital: product.format === 'digital' || product.format === 'both',
    is_physical: product.format === 'physical' || product.format === 'both',
    has_custom_preview: !!(previewAsset && previewAsset.file_path && fs.existsSync(previewAsset.file_path)),
    preview_filename: previewAsset?.file_name || null,
    preview_file_url: `/api/products/${product.id}/preview-file`,
    preview_images: [
      `/api/products/${product.id}/preview-image/1`,
      `/api/products/${product.id}/preview-image/2`
    ],
    total_pages: 52,
    sample_pages_count: 2,
    locked_pages_count: 50,
    social_proof: '🔥 High demand: 18 students studying this unit this week',
    is_watermarked: true
  };

  res.status(200).json({
    success: true,
    preview
  });
});

const escapePdfText = (str) => {
  return (str || '').replace(/[\\()]/g, '\\$&');
};

const generateSamplePreviewPdf = (title, subject, grade, examYear) => {
  const lines = [
    'BT',
    '/F1 18 Tf',
    '50 750 Td',
    `(${escapePdfText(title || 'Study Material Sample Preview')}) Tj`,
    '0 -26 Td',
    '/F1 11 Tf',
    `(${escapePdfText(`Subject: ${subject || 'General'} | Standard: ${grade || 'All Grades'} | Exam Year: ${examYear || 'National Curriculum'}`)}) Tj`,
    '0 -28 Td',
    '(-----------------------------------------------------------------------------------------------------) Tj',
    '0 -20 Td',
    '/F1 12 Tf',
    '(*** AUTHORIZED STUDY MATERIAL SPECIMEN - WATERMARKED PREVIEW ***) Tj',
    '0 -20 Td',
    '(-----------------------------------------------------------------------------------------------------) Tj',
    '0 -32 Td',
    '/F1 11 Tf',
    '(1. Verified Academic Material authenticated by registered educators on EduMart.) Tj',
    '0 -22 Td',
    '(2. Full contents including complete theory, exercise questions, and model derivations) Tj',
    '0 -18 Td',
    '(   are unlocked and made immediately downloadable upon completing checkout.) Tj',
    '0 -24 Td',
    '(3. Instant digital delivery with license encryption and verified payment receipt.) Tj',
    '0 -24 Td',
    '(4. Official curriculum alignment with Sri Lankan national educational standards.) Tj',
    '0 -36 Td',
    '/F1 10 Tf',
    '(* Note: This document is a protected sample preview for evaluation purposes only.) Tj',
    '0 -16 Td',
    '(* To access the complete unabridged material, add to cart and proceed to checkout.) Tj',
    'ET'
  ];

  const content = lines.join('\n');
  const streamLength = Buffer.byteLength(content, 'utf8');

  let body = '';
  const offsets = [];

  function addObj(str) {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += str;
  }

  body += '%PDF-1.4\n';

  // Obj 1: Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Obj 3: Page
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');

  // Obj 4: Font
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // Obj 5: Stream
  addObj(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${content}\nendstream\nendobj\n`);

  const startxref = Buffer.byteLength(body, 'latin1');
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 0; i < 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, 'latin1');
};

/**
 * @desc    Stream or download sample preview document file
 * @route   GET /api/products/:id/preview-file
 * @access  Public
 */
const getProductPreviewFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isDownload = req.query.download === '1' || req.query.attachment === 'true';

  let asset = null;
  try {
    asset = await DigitalAsset.findOne({
      where: { product_id: id, is_preview: true }
    });
  } catch (_) {}

  if (asset && asset.file_path && fs.existsSync(asset.file_path)) {
    if (isDownload) {
      return res.download(path.resolve(asset.file_path), asset.file_name);
    } else {
      res.setHeader('Content-Type', asset.mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${asset.file_name}"`);
      return fs.createReadStream(path.resolve(asset.file_path)).pipe(res);
    }
  }

  // Fallback watermarked preview buffer
  const product = await Product.findByPk(id);
  const title = product?.title || 'Curriculum Sample Preview';
  const pdfBytes = generateSamplePreviewPdf(
    title,
    product?.subject,
    product?.grade_level,
    product?.exam_year
  );

  const safeFilename = `${title.replace(/[^a-zA-Z0-9_\-]/g, '_')}_preview.pdf`;
  const disposition = isDownload ? 'attachment' : 'inline';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${safeFilename}"`);
  res.setHeader('Content-Length', pdfBytes.length);
  res.status(200).send(pdfBytes);
});

/**
 * @desc    Generate high-resolution sample page SVG image
 */
const generateSamplePreviewSvg = (title, subject, grade, examYear, page = 1) => {
  const safeTitle = (title || 'Educational Material')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const safeSub = (subject || 'General Studies')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const safeGrade = (grade || 'National Curriculum')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const safeYear = (examYear || '2024/2025')
    .toString()
    .replace(/&/g, '&amp;');

  if (page === 2) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="800" height="1130">
  <defs>
    <linearGradient id="headerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
  </defs>

  <!-- Page Background -->
  <rect width="800" height="1130" fill="#ffffff" />
  <rect x="25" y="25" width="750" height="1080" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />

  <!-- Top Accent Bar -->
  <rect x="25" y="25" width="750" height="12" fill="url(#headerGrad2)" rx="4" />

  <!-- Running Header -->
  <g transform="translate(50, 65)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0284c7" letter-spacing="1">EDUMART ACADEMIC SPECIMEN • PART II</text>
    <text x="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b" text-anchor="end">${safeSub} • Page 2 of 52</text>
    <line x1="0" y1="12" x2="700" y2="12" stroke="#e2e8f0" stroke-width="1" />
  </g>

  <!-- Page 2 Content -->
  <g transform="translate(50, 110)">
    <!-- Section Title -->
    <rect x="0" y="0" width="700" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="16" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">SECTION B: HIGH-YIELD MODEL QUESTION &amp; STEP-BY-STEP DERIVATION</text>

    <!-- Question Box -->
    <rect x="0" y="55" width="700" height="135" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
    <text x="20" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#166534">Model Examination Question [Evaluation Weight: 25 Marks]</text>
    <text x="20" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#1e293b">
      <tspan x="20" dy="0">A. Formulate the fundamental governing equations for the given syllabus unit conditions.</tspan>
      <tspan x="20" dy="22">B. Deduce the exact analytical solution satisfying the boundary constraints and state all assumptions.</tspan>
      <tspan x="20" dy="22">C. Evaluate the margin of error and compare against official National Examination Board benchmark standards.</tspan>
    </text>

    <!-- Worked Solution Steps -->
    <text x="0" y="225" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#0f172a">MODEL SOLUTION BREAKDOWN &amp; POINT ALLOCATION:</text>

    <!-- Step 1 -->
    <rect x="0" y="242" width="700" height="85" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect x="0" y="242" width="8" height="85" fill="#0284c7" />
    <text x="24" y="268" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Step 1: Conceptual Identification &amp; Variable Substitution (7 Marks)</text>
    <text x="24" y="292" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569">
      <tspan x="24" dy="0">• State isolated system conservation laws and verify physical dimensionality invariance.</tspan>
      <tspan x="24" dy="18">• Construct the orthogonal coordinate system resolving components along the principal axis.</tspan>
    </text>

    <!-- Step 2 -->
    <rect x="0" y="342" width="700" height="85" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect x="0" y="342" width="8" height="85" fill="#10b981" />
    <text x="24" y="368" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Step 2: Algebraic Simplification &amp; Integration Method (10 Marks)</text>
    <text x="24" y="392" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569">
      <tspan x="24" dy="0">• Decompose rational algebraic polynomials into distinct partial fractions.</tspan>
      <tspan x="24" dy="18">• Integrate term-by-term and compute boundary constants using given initial values.</tspan>
    </text>

    <!-- Step 3 -->
    <rect x="0" y="442" width="700" height="85" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect x="0" y="442" width="8" height="85" fill="#f59e0b" />
    <text x="24" y="468" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Step 3: Verification &amp; Final Conclusion (8 Marks)</text>
    <text x="24" y="492" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#475569">
      <tspan x="24" dy="0">• Substitute limiting scenarios to confirm convergence and stability of the result.</tspan>
      <tspan x="24" dy="18">• State final magnitude and vector orientation with appropriate SI units.</tspan>
    </text>

    <!-- Examiner Advice Box -->
    <rect x="0" y="546" width="700" height="105" rx="8" fill="#fffbeb" stroke="#fcd34d" stroke-width="1" />
    <text x="20" y="574" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#92400e">💡 Examiner Feedback &amp; Common Pitfalls</text>
    <text x="20" y="598" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#78350f">
      <tspan x="20" dy="0">Over 64% of candidates lose marks due to skipping sign conventions in step 1.</tspan>
      <tspan x="20" dy="18">Always write clear intermediate steps as marked above to guarantee partial credit,</tspan>
      <tspan x="20" dy="18">even if final numerical evaluation contains arithmetic errors.</tspan>
    </text>

    <!-- Teaser Notice for next pages -->
    <rect x="0" y="670" width="700" height="85" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
    <text x="20" y="698" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1e40af">🔒 Notice: Pages 3 through 52 are locked in this evaluation sample.</text>
    <text x="20" y="722" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#1d4ed8">
      <tspan x="20" dy="0">Purchase this full study package to unlock 50 additional comprehensive questions,</tspan>
      <tspan x="20" dy="18">in-depth past paper analyses, and complete revision summary sheets.</tspan>
    </text>
  </g>

  <!-- Diagonal Watermark Overlay -->
  <g opacity="0.08" transform="rotate(-30 400 565)">
    <text x="400" y="500" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="6">EDUMART SAMPLE PREVIEW</text>
    <text x="400" y="550" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="700" fill="#0f172a" text-anchor="middle" letter-spacing="4">PROTECTED ACADEMIC SPECIMEN • EVALUATION ONLY</text>
    <text x="400" y="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="6">EDUMART SAMPLE PREVIEW</text>
  </g>

  <!-- Page Footer -->
  <g transform="translate(50, 1070)">
    <line x1="0" y1="0" x2="700" y2="0" stroke="#cbd5e1" stroke-width="1" />
    <text y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">EduMart Educational Marketplace • Authorized Student Preview Copy</text>
    <text x="700" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="end">Page 2 of 52</text>
  </g>
</svg>`;
  }

  // Page 1 Default
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="800" height="1130">
  <defs>
    <linearGradient id="headerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <!-- Background Paper -->
  <rect width="800" height="1130" fill="#ffffff" />
  <rect x="25" y="25" width="750" height="1080" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />

  <!-- Top Blue Banner -->
  <rect x="25" y="25" width="750" height="100" fill="url(#headerGrad1)" rx="8" />

  <!-- Header Text -->
  <g transform="translate(60, 65)">
    <circle cx="25" cy="18" r="22" fill="#ffffff" opacity="0.15" />
    <path d="M 25 3 L 42 10 L 42 24 C 42 34 25 41 25 41 C 25 41 8 34 8 24 L 8 10 Z" fill="#ffffff" opacity="0.9" />
    <text x="60" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#93c5fd" letter-spacing="1.5">OFFICIAL EDUMART STUDY MATERIAL SPECIMEN</text>
    <text x="60" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#ffffff" letter-spacing="0.5">National Curriculum Verified Resource</text>
  </g>

  <!-- Title & Metadata Block -->
  <g transform="translate(50, 155)">
    <!-- Document Title -->
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#0f172a">${safeTitle}</text>
    
    <!-- Meta Chips Grid -->
    <g transform="translate(0, 32)">
      <rect x="0" y="0" width="160" height="32" rx="16" fill="#eff6ff" stroke="#bfdbfe" />
      <text x="80" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#1e40af" text-anchor="middle">📚 ${safeSub}</text>

      <rect x="170" y="0" width="160" height="32" rx="16" fill="#f0fdf4" stroke="#bbf7d0" />
      <text x="250" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#166534" text-anchor="middle">🎓 ${safeGrade}</text>

      <rect x="340" y="0" width="160" height="32" rx="16" fill="#fef3c7" stroke="#fde68a" />
      <text x="420" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#92400e" text-anchor="middle">📅 Exam: ${safeYear}</text>

      <rect x="510" y="0" width="190" height="32" rx="16" fill="#faf5ff" stroke="#e9d5ff" />
      <text x="605" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#6b21a8" text-anchor="middle">🔒 Verified Teacher License</text>
    </g>

    <line x1="0" y1="85" x2="700" y2="85" stroke="#e2e8f0" stroke-width="1.5" />
  </g>

  <!-- Page 1 Body Content -->
  <g transform="translate(50, 265)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#1e293b" letter-spacing="0.5">PART I: THEORETICAL FOUNDATION &amp; CORE COMPETENCIES</text>
    <rect x="0" y="12" width="700" height="2" fill="#0284c7" />

    <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#334155">
      <tspan x="0" dy="0">This comprehensive study guide compiles high-frequency exam objectives aligned directly with</tspan>
      <tspan x="0" dy="20">the Department of Examinations national syllabus standards. Each core principle is presented</tspan>
      <tspan x="0" dy="20">with concise analytical proofs, visual schematics, and model step-by-step examination derivations.</tspan>
    </text>

    <!-- Key Bullet Cards -->
    <g transform="translate(0, 115)">
      <rect x="0" y="0" width="335" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">1. Master Concept Syntheses</text>
      <text x="16" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#64748b">
        <tspan x="16" dy="0">• Rigorous axiomatic formulations</tspan>
        <tspan x="16" dy="18">• Clear variable declarations</tspan>
        <tspan x="16" dy="18">• Real-world exam problem mappings</tspan>
      </text>

      <rect x="365" y="0" width="335" height="110" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <text x="381" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">2. High-Yield Examination Strategies</text>
      <text x="381" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#64748b">
        <tspan x="381" dy="0">• Full structured essay solutions</tspan>
        <tspan x="381" dy="18">• Official marking scheme allocation</tspan>
        <tspan x="381" dy="18">• Common student pitfalls &amp; traps</tspan>
      </text>
    </g>

    <!-- Formula / High Priority Concept Highlight Box -->
    <g transform="translate(0, 245)">
      <rect x="0" y="0" width="700" height="145" rx="8" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5" />
      <rect x="0" y="0" width="8" height="145" fill="#0284c7" />
      <text x="24" y="30" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0369a1">⭐ CORE FORMULA SPECIFICATION &amp; CRITICAL THEOREM BOX</text>
      <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#0f172a" font-weight="600">
        <tspan x="24" dy="0">Mathematical Invariance &amp; Governing Theorem:</tspan>
      </text>
      <text x="24" y="82" font-family="Courier, monospace" font-size="13" fill="#0c4a6e" font-weight="700">
        <tspan x="40" dy="0">∑ F_x = 0  ;  ∑ F_y = 0  ;  ∫ [f(x) ± g(x)] dx = F(x) ± G(x) + C</tspan>
      </text>
      <text x="24" y="110" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#0369a1">
        <tspan x="24" dy="0">Applicability Note: Always state initial reference frame and boundary conditions</tspan>
        <tspan x="24" dy="16">prior to applying this derivation to earn maximum partial marks.</tspan>
      </text>
    </g>

    <!-- Document Assurance Badge -->
    <g transform="translate(0, 415)">
      <rect x="0" y="0" width="700" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      <circle cx="40" cy="45" r="22" fill="#dbeafe" />
      <text x="40" y="51" font-family="sans-serif" font-size="18" text-anchor="middle">✓</text>
      <text x="75" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#0f172a">Authenticated Educator Copyright &amp; Academic Guarantee</text>
      <text x="75" y="56" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#64748b">
        <tspan x="75" dy="0">Prepared by verified subject matter educators. All intellectual property protected.</tspan>
        <tspan x="75" dy="16">Purchased material includes high-resolution digital master copy without watermarks.</tspan>
      </text>
    </g>
  </g>

  <!-- Diagonal Watermark Overlay -->
  <g opacity="0.08" transform="rotate(-30 400 565)">
    <text x="400" y="500" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="6">EDUMART SAMPLE PREVIEW</text>
    <text x="400" y="550" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="700" fill="#0f172a" text-anchor="middle" letter-spacing="4">PROTECTED ACADEMIC SPECIMEN • EVALUATION ONLY</text>
    <text x="400" y="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="6">EDUMART SAMPLE PREVIEW</text>
  </g>

  <!-- Page Footer -->
  <g transform="translate(50, 1070)">
    <line x1="0" y1="0" x2="700" y2="0" stroke="#cbd5e1" stroke-width="1" />
    <text y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">EduMart Educational Marketplace • Authorized Student Preview Copy</text>
    <text x="700" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="end">Page 1 of 52</text>
  </g>
</svg>`;
};

/**
 * @desc    Get preview sample image for a material
 * @route   GET /api/products/:id/preview-image/:page?
 * @access  Public
 */
const getProductPreviewImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.params.page || '1', 10) || 1;

  const product = await Product.findByPk(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const svg = generateSamplePreviewSvg(
    product.title,
    product.subject,
    product.grade_level,
    product.exam_year,
    page
  );

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(svg);
});

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getSuggestions,
  getRelatedProducts,
  getProductPreview,
  getProductPreviewFile,
  getProductPreviewImage,
  createProduct,
  updateProduct,
  deleteProduct,
  seedEducationalCatalogIfEmpty
};
