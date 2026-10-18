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

const getSubjectCurriculum = (subject, title) => {
  const sub = (subject || '').toLowerCase();
  if (sub.includes('chem')) {
    return {
      toc: [
        'Unit 1: Atomic Structure, Chemical Bonding & Periodicity',
        'Unit 2: Chemical Energetics, Kinetics & Phase Equilibria',
        'Unit 3: Acid-Base & Redox Equilibrium in Aqueous Systems',
        'Unit 4: Organic Chemistry: Hydrocarbons, Carbonyls & Aromatics',
        'Unit 5: Environmental Chemistry & Analytical Spectroscopy'
      ],
      excerpt: `Sample Question 01 [Structured Essay - 10 Marks]:\n(a) Write the equilibrium expression for the dissociation of weak acid HA in aqueous solution.\n(b) A 0.05 mol/dm3 solution has a pH of 3.12. Calculate the acid dissociation constant (Ka).\n(c) Calculate the pH shift upon adding 0.01 moles of solid NaA to 500 mL of this solution.\n\nOfficial Marking Rubric:\n- [Part a]: 2 marks for equilibrium constant formulation with correct state symbols.\n- [Part b]: 4 marks (2 marks for [H+] derivation + 2 marks for Ka calculation with units).\n- [Part c]: 4 marks for Henderson-Hasselbalch substitution and final pH.`
    };
  } else if (sub.includes('math')) {
    return {
      toc: [
        'Unit 1: Polynomials, Mathematical Induction & Complex Numbers',
        'Unit 2: Calculus: Integration by Substitution & Definite Integrals',
        'Unit 3: Matrices, Determinants & 3D Vector Geometry',
        'Unit 4: Coplanar Forces, Friction & Equilibrium of Rigid Rods',
        'Unit 5: Projectiles, Relative Velocity & Work-Energy Theorem'
      ],
      excerpt: `Sample Question 01 [Pure Mathematics - 25 Marks]:\n(a) Show that (x - 2) is a factor of f(x) = 2x^3 - 5x^2 + x + 2.\n(b) Hence evaluate the definite integral from 0 to 1 of 1/(2x^3 - 5x^2 + x + 2) dx.\n\nOfficial Marking Scheme:\n- [Part a]: 5 marks (Factor theorem verification + remainder validation).\n- [Part b]: 10 marks for partial fractions decomposition: A/(x-2) + B/(2x+1) + C/(x-1).\n- 10 marks for logarithmic integration, constant evaluation, and limits substitution.`
    };
  } else if (sub.includes('phys')) {
    return {
      toc: [
        'Unit 1: Measurement, Dimensional Analysis & Precision Standards',
        'Unit 2: Mechanics: Newton Laws, Circular Motion & Simple Harmonics',
        'Unit 3: Wave Phenomena, Acoustics & Physical/Ray Optics',
        'Unit 4: Electrostatic Fields, Current Electricity & Circuit Laws',
        'Unit 5: Electromagnetism, Electronics & Modern Quantum Physics'
      ],
      excerpt: `Sample Question 01 [Applied Mechanics & Energy - 15 Marks]:\n(a) State the principle of conservation of linear momentum and conditions for elastic collision.\n(b) A sphere of mass m moving at velocity u collides obliquely with an identical stationary sphere.\n    Determine the angle between velocities after collision if restitution coefficient e = 1.\n\nMarking Breakdown:\n- [Part a]: 3 marks for rigorous definition of isolated system momentum invariance.\n- [Part b]: 6 marks for resolving equations along and perpendicular to line of impact.\n- 6 marks for trigonometric proof showing final angle is exactly 90 degrees.`
    };
  } else if (sub.includes('bio')) {
    return {
      toc: [
        'Unit 1: Chemical & Cellular Foundations of Living Organisms',
        'Unit 2: Genetics, DNA Replication, Transcription & Translation',
        'Unit 3: Plant Form & Physiology: Photosynthesis & Mineral Transport',
        'Unit 4: Animal Physiology: Cardiac Cycle, Nerve Impulses & Homeostasis',
        'Unit 5: Ecology, Biodiversity Conservation & Sri Lankan Biomes'
      ],
      excerpt: `Sample Question 01 [Cell Biology & Physiology - 15 Marks]:\n(a) Differentiate between C3, C4, and CAM pathways in terms of primary CO2 acceptor and anatomy.\n(b) Explain the role of RuBisCO oxygenase activity in photorespiration under drought stress.\n\nMarking Breakdown:\n- [Part a]: 8 marks (Kranz anatomy diagram + PEP carboxylase vs RuBisCO comparative matrix).\n- [Part b]: 7 marks for metabolic pathway explanation and ATP/NADPH wastage analysis.`
    };
  } else {
    return {
      toc: [
        'Unit 1: National Curriculum Guidelines & Core Competencies',
        'Unit 2: Fundamental Principles, Key Terminology & Definitions',
        'Unit 3: Structured Examination Techniques & Rubric Breakdown',
        'Unit 4: Model Examination Specimen Paper (Part A)',
        'Unit 5: Model Essay Problems with Alternate Resolution Methods'
      ],
      excerpt: `Sample Question 01 [Model Specimen Problem - 10 Marks]:\nEvaluate the core concepts presented in Unit 1 and apply them to solve the practical scenario.\n\nMarking Scheme:\n- 3 marks: Conceptual formulation and initial hypothesis.\n- 4 marks: Application of standard analytical methodology.\n- 3 marks: Synthesis, validation, and final recommendations.`
    };
  }
};

/**
 * @desc    Get preview / syllabus sample pages for a material
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

  const curr = getSubjectCurriculum(product.subject, product.title);

  const preview = {
    id: product.id,
    productId: product.id,
    title: product.title,
    price: parseFloat(product.price) || 0,
    subject: product.subject,
    grade_level: product.grade_level,
    exam_year: product.exam_year,
    format: product.format,
    is_digital: product.format === 'digital' || product.format === 'both',
    is_physical: product.format === 'physical' || product.format === 'both',
    has_custom_preview: !!(previewAsset && previewAsset.file_path && fs.existsSync(previewAsset.file_path)),
    preview_filename: previewAsset?.file_name || null,
    preview_file_url: `/api/products/${product.id}/preview-file`,
    preview_download_url: `/api/products/${product.id}/preview-file?download=1`,
    tableOfContents: curr.toc,
    sampleExcerpt: curr.excerpt,
    is_watermarked: true,
    total_preview_pages: 3
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
  const curr = getSubjectCurriculum(subject, title);
  const lines = [
    'BT',
    '/F1 18 Tf',
    '50 750 Td',
    `(${escapePdfText(title || 'Curriculum Sample Preview')}) Tj`,
    '0 -22 Td',
    '/F1 11 Tf',
    `(${escapePdfText(`Subject: ${subject || 'General'} | Grade: ${grade || 'All Grades'} | Exam: ${examYear || 'National Curriculum'}`)}) Tj`,
    '0 -20 Td',
    '(*** AUTHORIZED WATERMARKED SAMPLE PREVIEW - EDUMART MARKETPLACE ***) Tj',
    '0 -26 Td',
    '/F1 13 Tf',
    '(Curriculum Structure & Table of Contents:) Tj',
    '0 -18 Td',
    '/F1 10 Tf'
  ];

  curr.toc.forEach((item) => {
    lines.push(`(${escapePdfText(item)}) Tj`, '0 -16 Td');
  });

  lines.push(
    '0 -10 Td',
    '/F1 13 Tf',
    '(Model Examination Question & Marking Rubric Excerpt:) Tj',
    '0 -18 Td',
    '/F1 9 Tf'
  );

  curr.excerpt.split('\n').forEach((exLine) => {
    if (exLine.trim() === '') {
      lines.push('0 -10 Td');
    } else {
      lines.push(`(${escapePdfText(exLine)}) Tj`, '0 -14 Td');
    }
  });

  lines.push(
    '0 -16 Td',
    '/F1 9 Tf',
    '(* Note: This is an authorized preview copy watermarked for student syllabus evaluation.) Tj',
    '0 -14 Td',
    '(* The complete unredacted material is made immediately accessible after checkout.) Tj',
    'ET'
  );

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

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getSuggestions,
  getRelatedProducts,
  getProductPreview,
  getProductPreviewFile,
  createProduct,
  updateProduct,
  deleteProduct,
  seedEducationalCatalogIfEmpty
};
