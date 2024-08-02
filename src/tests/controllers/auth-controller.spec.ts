import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { signup, signin, getUser, logout } from '../../controllers/auth.controller';
import userModel from '../../models/userModel';

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

// Middleware to mock session data
app.use((req, _res, next) => {
  req.session = Object.assign(req.session, {
    user: {
      _id: 'testUserId',
      email: 'testuser@example.com',
    },
  });
  next();
});

// Routes for testing
app.post('/signup', signup);
app.post('/signin', signin);
app.get('/user', getUser);
app.post('/logout', logout);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/signup').send({
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

      const response = await request(app).post('/signup').send({
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

      const response = await request(app).post('/signup').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('failed to save user');
    });
  });

  describe('POST /signin', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/signin').send({
        email: 'testuser@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('missing information');
    });

    it('should return 400 if user is not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/signin').send({
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

      const response = await request(app).post('/signin').send({
        email: 'testuser@example.com',
        password: 'wrongPassword',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email or password don't match");
    });

    it('should return 500 if there is an error during signin', async () => {
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/signin').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user');
    });
  });

  describe('GET /user', () => {
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
      unauthenticatedApp.get('/user', getUser);

      const response = await request(unauthenticatedApp).get('/user');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('You are not authenticated');
    });

    it('should return 200 and the user data if user is found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: userId,
        email: 'testuser@example.com',
        username: 'testuser',
        messages: [],
      });

      (userModel.findById as jest.Mock).mockImplementation(() => ({
        populate: mockPopulate,
      }));

      const response = await request(app)
        .get('/user')
        .set('Cookie', ['sessionId=testSessionId']);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('testuser@example.com');
      expect(response.body.username).toBe('testuser');
    });

    it('should return 500 if there is an error during getUser', async () => {
      const mockPopulate = jest.fn().mockRejectedValue(new Error('Database error'));
      (userModel.findById as jest.Mock).mockImplementation(() => ({
        populate: mockPopulate,
      }));

      const response = await request(app)
        .get('/user')
        .set('Cookie', ['sessionId=testSessionId']);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user');
    });
  });

  describe('POST /logout', () => {
    it('should return 200 and disconnect the user', async () => {
      const response = await request(app).post('/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Disconnected');
    });
  });
});
