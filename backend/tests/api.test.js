const request = require('supertest');

// Mock the database before importing app
jest.mock('../models/applicationModel', () => ({}));

// Mock auth controller
jest.mock('../controllers/authController', () => ({
    register: jest.fn((req, res) => {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (email === 'existing@test.com') {
            return res.status(400).json({ message: 'User already exists' });
        }
        return res.status(201).json({ message: 'User registered successfully' });
    }),
    login: jest.fn((req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        if (email === 'john@test.com' && password === 'password123') {
            return res.status(200).json({
                message: 'Login successful',
                token: 'mock-jwt-token-123',
                username: 'john_doe',
                role: 'student'
            });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
    }),
    searchEmails: jest.fn((req, res) => {
        return res.status(200).json(['john@test.com', 'jane@test.com']);
    })
}));

// Mock scheme controller
jest.mock('../controllers/schemeController', () => ({
    getAllSchemes: jest.fn((req, res) => {
        return res.status(200).json([
            { id: 1, title: 'Test Scheme', description: 'A test scheme', eligibility: 'All', deadline: '2026-12-31' }
        ]);
    }),
    addScheme: jest.fn((req, res) => {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        return res.status(201).json({ message: 'Scheme added', id: 1 });
    }),
    deleteScheme: jest.fn((req, res) => {
        return res.status(200).json({ message: 'Scheme deleted' });
    })
}));

// Mock application controller
jest.mock('../controllers/applicationController', () => ({
    getMyApplications: jest.fn((req, res) => res.status(200).json([])),
    getMyStats: jest.fn((req, res) => res.status(200).json({ total: 5, pending: 2, approved: 2, rejected: 1 })),
    applyToScheme: jest.fn((req, res) => res.status(201).json({ message: 'Application submitted' })),
    getAllApplications: jest.fn((req, res) => res.status(200).json([])),
    getStats: jest.fn((req, res) => res.status(200).json({ total: 10, pending: 3, approved: 5, rejected: 2 })),
    updateStatus: jest.fn((req, res) => res.status(200).json({ message: 'Status updated' })),
    deleteApplication: jest.fn((req, res) => res.status(200).json({ message: 'Application deleted' }))
}));

// Mock middleware — bypass JWT verification for tests
jest.mock('../middleware/authMiddleware', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 1, role: 'admin', email: 'admin@test.com' };
        next();
    },
    isAdmin: (req, res, next) => next(),
    isStudent: (req, res, next) => next()
}));

const app = require('../server');

/* ========================
   AUTH TESTS
======================== */
describe('Auth Endpoints', () => {
    test('POST /api/auth/register — successful registration', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'new_user', email: 'new@test.com', password: 'pass123' });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain('registered');
    });

    test('POST /api/auth/register — fails without username', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@test.com', password: 'pass123' });

        expect(res.statusCode).toBe(400);
    });

    test('POST /api/auth/register — fails for existing user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'existing', email: 'existing@test.com', password: 'pass123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('already exists');
    });

    test('POST /api/auth/login — successful login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'john@test.com', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.role).toBe('student');
    });

    test('POST /api/auth/login — invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'wrong@test.com', password: 'wrong' });

        expect(res.statusCode).toBe(401);
    });

    test('POST /api/auth/login — fails without email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'pass123' });

        expect(res.statusCode).toBe(400);
    });

    test('GET /api/auth/emails — returns email list', async () => {
        const res = await request(app).get('/api/auth/emails');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

/* ========================
   SCHEME TESTS
======================== */
describe('Scheme Endpoints', () => {
    test('GET /api/schemes — returns scheme list', async () => {
        const res = await request(app).get('/api/schemes');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('POST /api/admin/schemes — adds scheme', async () => {
        const res = await request(app)
            .post('/api/admin/schemes')
            .send({ title: 'New Scheme', description: 'Desc', eligibility: 'All', deadline: '2026-12-31' });

        expect(res.statusCode).toBe(201);
    });

    test('DELETE /api/admin/schemes/1 — deletes scheme', async () => {
        const res = await request(app).delete('/api/admin/schemes/1');

        expect(res.statusCode).toBe(200);
    });
});

/* ========================
   APPLICATION TESTS
======================== */
describe('Application Endpoints', () => {
    test('GET /api/admin/applications — returns application list', async () => {
        const res = await request(app).get('/api/admin/applications');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/admin/applications/stats — returns statistics', async () => {
        const res = await request(app).get('/api/admin/applications/stats');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('pending');
        expect(res.body).toHaveProperty('approved');
        expect(res.body).toHaveProperty('rejected');
    });

    test('POST /api/student/applications — submit application', async () => {
        const res = await request(app)
            .post('/api/student/applications')
            .send({ scheme_name: 'Test Scheme' });

        expect(res.statusCode).toBe(201);
    });

    test('PUT /api/admin/applications/status/1 — update status', async () => {
        const res = await request(app)
            .put('/api/admin/applications/status/1')
            .send({ status: 'approved', admin_note: 'Looks good' });

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/admin/applications/1 — delete application', async () => {
        const res = await request(app).delete('/api/admin/applications/1');

        expect(res.statusCode).toBe(200);
    });
});

/* ========================
   ROOT ENDPOINT
======================== */
describe('Root', () => {
    test('GET / — returns welcome message', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('API Running');
    });
});
