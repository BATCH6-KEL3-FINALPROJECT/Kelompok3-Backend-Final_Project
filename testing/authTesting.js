// ongoing contoh template unit testing

const request = require('supertest');
const app = require('../app');

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'newuser',
                password: 'newpassword'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should not register user with missing username or password', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: '',
                password: 'newpassword'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Username and password are required');
    });

    it('should login successfully with correct credentials', async () => {
        await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Login successful');
    });

    it('should not login with incorrect credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'wronguser',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});
