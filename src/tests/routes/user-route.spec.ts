import request from 'supertest';
import express from 'express';
import session from 'express-session';
import userRoutes from '../../routes/users.routes';
import { register, login } from '../../controllers/users.controller';
import pool from '../../boot/database/db_connect';
import { badRequest, userAlreadyExists, success, notFound, queryError } from '../../constants/statusCodes';

jest.mock('../../controllers/users.controller');
jest.mock('../../boot/database/db_connect');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use('/user', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end(); // Close the pool connection
  });

  describe('POST /user/register', () => {
    it('should call register controller', async () => {
      const mockRegister = register as jest.Mock;
      mockRegister.mockImplementation((_req, res) => {
        res.status(success).json({ message: 'User created' });
      });

      const response = await request(app).post('/user/register').send({
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
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('should return bad request when parameters are missing', async () => {
      const mockRegister = register as jest.Mock;
      mockRegister.mockImplementation((_req, res) => {
        res.status(badRequest).json({ message: 'Missing parameters' });
      });

      const response = await request(app).post('/user/register').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('should return user already exists if the user already has an account', async () => {
      const mockRegister = register as jest.Mock;
      mockRegister.mockImplementation((_req, res) => {
        res.status(userAlreadyExists).json({ message: 'User already has an account' });
      });

      const response = await request(app).post('/user/register').send({
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
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('should handle query errors during registration', async () => {
      const mockRegister = register as jest.Mock;
      mockRegister.mockImplementation((_req, res) => {
        res.status(queryError).json({ message: 'Exception occurred while registering' });
      });

      const response = await request(app).post('/user/register').send({
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password',
        country: 'Country',
        city: 'City',
        street: 'Street',
        creation_date: '2021-01-01',
      });

      expect(response.status).toBe(queryError);
      expect(response.body.message).toBe('Exception occurred while registering');
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /user/login', () => {
    it('should call login controller', async () => {
      const mockLogin = login as jest.Mock;
      mockLogin.mockImplementation((_req, res) => {
        res.status(success).json({ token: 'test-token', username: 'testuser' });
      });

      const response = await request(app).post('/user/login').send({
        email: 'testuser@example.com',
        password: 'password',
      });

      expect(response.status).toBe(success);
      expect(response.body.token).toBe('test-token');
      expect(response.body.username).toBe('testuser');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should return bad request when parameters are missing', async () => {
      const mockLogin = login as jest.Mock;
      mockLogin.mockImplementation((_req, res) => {
        res.status(badRequest).json({ message: 'Missing parameters' });
      });

      const response = await request(app).post('/user/login').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should return not found when email or password is incorrect', async () => {
      const mockLogin = login as jest.Mock;
      mockLogin.mockImplementation((_req, res) => {
        res.status(notFound).json({ message: 'Incorrect email/password' });
      });

      const response = await request(app).post('/user/login').send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(notFound);
      expect(response.body.message).toBe('Incorrect email/password');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should handle query errors during login', async () => {
      const mockLogin = login as jest.Mock;
      mockLogin.mockImplementation((_req, res) => {
        res.status(queryError).json({ message: 'Exception occurred while logging in' });
      });

      const response = await request(app).post('/user/login').send({
        email: 'testuser@example.com',
        password: 'password',
      });

      expect(response.status).toBe(queryError);
      expect(response.body.message).toBe('Exception occurred while logging in');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });
});
