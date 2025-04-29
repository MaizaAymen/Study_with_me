// __tests__/api.test.js
const request = require('supertest');
const app = require('../server');

// Variables to store auth tokens between tests
describe('Backend API Tests', () => {
  let adminToken;
  let studentToken;

  // Test the registration endpoint
  test('POST /auth/register - should register a new student user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'teststudent',
        password: 'password123',
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/registered successfully/i);
  });

  // Test login for admin user (seeded in server startup)
  test('POST /auth/login - should login admin user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'aymen', password: '123456789' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token; // save for later
  });

  // Test protected route with admin token
  test('GET /admin/users - should list all users for admin', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test login for student user
  test('POST /auth/login - should login student user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'teststudent', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    studentToken = res.body.token;
  });

  // Test chat history fetch for student
  test('GET /chats - should fetch empty chat history for new student', async () => {
    const res = await request(app)
      .get('/chats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
