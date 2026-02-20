const request = require('supertest');
const app = require('../server');
const { connectTestDB, disconnectTestDB, clearDatabase } = require('./setup');
const Category = require('../models/Category');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Categories API', () => {
  let adminUser;
  let adminToken;
  let testCategory;

  beforeAll(async () => {
    await connectTestDB();
    
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });

    // Create JWT token for admin
    adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Clear only category data, not all collections
    await Category.deleteMany();
    
    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'This is a test category',
      isActive: true,
    });
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('GET /api/admin/categories', () => {
    test('should get all categories with admin token', async () => {
      const response = await request(app)
        .get('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    test('should return 401 without token', async () => {
      const response = await request(app).get('/api/admin/categories');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/admin/categories', () => {
    test('should create a new category', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'This is a new category',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          name: categoryData.name,
          description: categoryData.description,
          isActive: categoryData.isActive,
        })
      );
    });

    test('should return 400 if name is missing', async () => {
      const categoryData = {
        description: 'This is a category without name',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/admin/categories/:id', () => {
    test('should get category by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          _id: testCategory._id.toString(),
          name: testCategory.name,
          description: testCategory.description,
        })
      );
    });

    test('should return 404 if category not found', async () => {
      const nonExistentId = '600000000000000000000000';
      
      const response = await request(app)
        .get(`/api/admin/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/admin/categories/:id', () => {
    test('should update category', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'This is an updated category',
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/admin/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining(updateData)
      );
    });

    test('should return 404 if category not found', async () => {
      const nonExistentId = '600000000000000000000000';
      const updateData = {
        name: 'Updated Category',
      };

      const response = await request(app)
        .put(`/api/admin/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/admin/categories/:id', () => {
    test('should delete category', async () => {
      const response = await request(app)
        .delete(`/api/admin/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toEqual('Category deleted successfully');

      // Verify category is deleted
      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory).toBeNull();
    });

    test('should return 404 if category not found', async () => {
      const nonExistentId = '600000000000000000000000';
      
      const response = await request(app)
        .delete(`/api/admin/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});
