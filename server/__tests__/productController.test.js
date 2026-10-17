const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const { Product, Category, User } = require('../src/models');

describe('Product & Catalog Controller', () => {
  let tutorUser;
  let studentUser;
  let tutorToken;
  let studentToken;
  let testCategory;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Category.sync({ force: true });
    await Product.sync({ force: true });

    // Create a tutor
    tutorUser = await User.create({
      first_name: 'Vidula',
      last_name: 'Teacher',
      email: 'tutor.vidula@test.com',
      password_hash: 'Password123!',
      role: 'tutor',
      institution: 'Ananda College',
      is_verified: true,
      is_active: true
    });

    // Create a student
    studentUser = await User.create({
      first_name: 'Kamal',
      last_name: 'Perera',
      email: 'kamal.student@test.com',
      password_hash: 'Password123!',
      role: 'student',
      is_verified: true,
      is_active: true
    });

    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    tutorToken = jwt.sign({ id: tutorUser.id }, jwtSecret, { expiresIn: '1d' });
    studentToken = jwt.sign({ id: studentUser.id }, jwtSecret, { expiresIn: '1d' });

    testCategory = await Category.create({
      name: 'Combined Maths Test Category',
      description: 'Test category description',
      level: 1,
      sort_order: 1,
      is_active: true
    });
  });

  afterAll(async () => {
    await Product.drop();
    await Category.drop();
    await User.drop();
  });

  describe('GET /api/products', () => {
    it('should auto-seed demo products when empty and return paginated list', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('currentPage', 1);
      expect(res.body.products[0]).toHaveProperty('category');
    });

    it('should search products by keyword matching title or description', async () => {
      const res = await request(app).get('/api/products?keyword=Physics');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      const allMatch = res.body.products.some(p =>
        p.title.includes('Physics') || p.description.includes('Physics') || p.subject.includes('Physics')
      );
      expect(allMatch).toBe(true);
    });

    it('should filter products by subject', async () => {
      const res = await request(app).get('/api/products?subject=Biology');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      res.body.products.forEach(product => {
        expect(product.subject.toLowerCase()).toContain('biology');
      });
    });

    it('should filter products by format (digital or physical)', async () => {
      const res = await request(app).get('/api/products?format=digital');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.products.forEach(product => {
        expect(product.format).toBe('digital');
      });
    });

    it('should filter products by price range', async () => {
      const min = 700;
      const max = 1500;
      const res = await request(app).get(`/api/products?minPrice=${min}&maxPrice=${max}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.products.forEach(product => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(min);
        expect(price).toBeLessThanOrEqual(max);
      });
    });

    it('should sort products by price ascending and descending', async () => {
      const resAsc = await request(app).get('/api/products?sort=price_asc');
      expect(resAsc.statusCode).toBe(200);
      const pricesAsc = resAsc.body.products.map(p => parseFloat(p.price));
      for (let i = 0; i < pricesAsc.length - 1; i++) {
        expect(pricesAsc[i]).toBeLessThanOrEqual(pricesAsc[i + 1]);
      }

      const resDesc = await request(app).get('/api/products?sort=price_desc');
      expect(resDesc.statusCode).toBe(200);
      const pricesDesc = resDesc.body.products.map(p => parseFloat(p.price));
      for (let i = 0; i < pricesDesc.length - 1; i++) {
        expect(pricesDesc[i]).toBeGreaterThanOrEqual(pricesDesc[i + 1]);
      }
    });

    it('should sort products by highest rating', async () => {
      const res = await request(app).get('/api/products?sort=rating_desc');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for a non-existent product UUID', async () => {
      const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('should return product details including category and seller info', async () => {
      const listRes = await request(app).get('/api/products');
      const targetId = listRes.body.products[0].id;

      const res = await request(app).get(`/api/products/${targetId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.id).toBe(targetId);
      expect(res.body.product).toHaveProperty('category');
      expect(res.body.product).toHaveProperty('seller');
    });
  });

  describe('GET /api/categories', () => {
    it('should retrieve all active categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/suggestions', () => {
    it('should return trending suggestions when query is empty', async () => {
      const res = await request(app).get('/api/products/suggestions');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThan(0);
    });

    it('should return matching suggestions when query is provided', async () => {
      const res = await request(app).get('/api/products/suggestions?q=Physics');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });
  });

  describe('GET /api/products/:id/related & /preview', () => {
    it('should return related products within the same subject/category', async () => {
      const listRes = await request(app).get('/api/products');
      const targetId = listRes.body.products[0].id;

      const res = await request(app).get(`/api/products/${targetId}/related`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      res.body.products.forEach(p => {
        expect(p.id).not.toBe(targetId);
      });
    });

    it('should return curriculum preview details with watermarked sample excerpt', async () => {
      const listRes = await request(app).get('/api/products');
      const targetId = listRes.body.products[0].id;

      const res = await request(app).get(`/api/products/${targetId}/preview`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.preview).toHaveProperty('tableOfContents');
      expect(res.body.preview).toHaveProperty('sampleExcerpt');
      expect(res.body.preview.is_watermarked).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ title: 'Unauthorized item' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject non-seller students', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student attempting upload',
          description: 'Desc',
          price: 500,
          subject: 'Maths',
          grade_level: 'A/L',
          product_type: 'past_paper',
          category_id: testCategory.id
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate missing required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          title: 'Incomplete product'
          // missing description, price, subject, etc.
        });

      expect(res.statusCode).toBe(400);
    });

    it('should allow tutor to create new educational material', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          title: '2024 Combined Maths Probability Special Revision Module',
          description: 'Intensive probability questions with permutations and combinations notes.',
          price: 1100.00,
          subject: 'Combined Mathematics',
          grade_level: 'A/L Grade 13',
          exam_year: 2024,
          product_type: 'revision_notes',
          format: 'digital',
          category_id: testCategory.id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.title).toBe('2024 Combined Maths Probability Special Revision Module');
      expect(res.body.product.seller_id).toBe(tutorUser.id);
    });
  });

  describe('PUT /api/products/:id and DELETE /api/products/:id', () => {
    let createdProduct;

    beforeEach(async () => {
      createdProduct = await Product.create({
        seller_id: tutorUser.id,
        category_id: testCategory.id,
        title: 'Original Title for Update/Delete test',
        description: 'Original description',
        price: 500.00,
        subject: 'Physics',
        grade_level: 'A/L Grade 12',
        product_type: 'past_paper',
        format: 'digital',
        is_active: true,
        is_approved: true
      });
    });

    it('should allow product owner to update details', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          title: 'Updated Title for Product',
          price: 650.00
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.title).toBe('Updated Title for Product');
      expect(parseFloat(res.body.product.price)).toBe(650.00);
    });

    it('should allow product owner to delete product', async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${tutorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findByPk(createdProduct.id);
      expect(check).toBeNull();
    });
  });
});
