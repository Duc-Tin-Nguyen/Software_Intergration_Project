import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { register, login } from '../../controllers/users.controller';
import pool from '../../boot/database/db_connect';
import jwt from 'jsonwebtoken';
import { badRequest, queryError, success, notFound, userAlreadyExists } from '../../constants/statusCodes';

jest.mock('../../boot/database/db_connect');
jest.mock('../../middleware/winston');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true,
  })
);

// Routes for testing
app.post('/register', register);
app.post('/login', login);

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end(); // Close the pool connection
  });

  describe('POST /register', () => {
    it('should return bad request when parameters are missing', async () => {
      const response = await request(app).post('/register').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
    });

    it('should return user already exists if the user already has an account', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      const response = await request(app).post('/register').send({
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password',
        country: 'Country',
        city: 'City',
        street: 'Street',
        creation_date: '2021-01-01',
      });

      expect(response.status).toBe(userAlreadyExists);
      expect(response.body.message).toBe('User already has an account');
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should register a new user successfully', async () => {
      const mockClient = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rowCount: 0 })
          .mockResolvedValue({ rowCount: 1 }),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      const response = await request(app).post('/register').send({
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password',
        country: 'Country',
        city: 'City',
        street: 'Street',
        creation_date: '2021-01-01',
      });

      expect(response.status).toBe(success);
      expect(response.body.message).toBe('User created');
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /login', () => {
    it('should return bad request when parameters are missing', async () => {
      const response = await request(app).post('/login').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
    });

    it('should return not found when email or password is incorrect', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app).post('/login').send({
        email: 'testuser@example.com',
        password: 'password',
      });

      expect(response.status).toBe(notFound);
      expect(response.body.message).toBe('Incorrect email/password');
    });

    it('should login successfully and return a token', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ email: 'testuser@example.com', username: 'testuser' }],
      });
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const response = await request(app).post('/login').send({
        email: 'testuser@example.com',
        password: 'password',
      });

      expect(response.status).toBe(success);
      expect(response.body.token).toBe('test-token');
      expect(response.body.username).toBe('testuser');
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should handle query errors during login', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/login').send({
        email: 'testuser@example.com',
        password: 'password',
      });

      expect(response.status).toBe(queryError);
      expect(response.body.message).toBe('Exception occurred while logging in');
    });
  });
});
