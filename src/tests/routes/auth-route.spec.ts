import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import authRoutes from '../../routes/auth.routes';
import userModel from '../../models/userModel';
import bcrypt from 'bcrypt';

jest.mock('../../models/userModel');
jest.mock('bcrypt');
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
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('missing information');
    });

    it('should return 200 and save the user if all required fields are provided', async () => {
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      (userModel.prototype.save as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'hashedPassword',
      });

      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('testuser@example.com');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 500 if there is an error saving the user', async () => {
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      (userModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/signup').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('failed to save user');
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('missing information');
    });

    it('should return 400 if user is not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if password does not match', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({
        email: 'testuser@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      const response = await request(app).post('/auth/login').send({
        email: 'testuser@example.com',
        password: 'wrongPassword',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email or password don't match");
    });

    it('should return 500 if there is an error during signin', async () => {
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 500 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.use(
        session({
          secret: 'testSecret',
          resave: false,
          saveUninitialized: true,
        })
      );
      unauthenticatedApp.use('/auth', authRoutes);

      const response = await request(unauthenticatedApp).get('/auth/me');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('You are not authenticated');
    });

  });

  describe('GET /auth/logout', () => {
    it('should return 200 and disconnect the user', async () => {
      const response = await request(app).get('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Disconnected');
    });
  });
});
