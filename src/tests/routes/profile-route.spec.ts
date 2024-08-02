import request from 'supertest';
import express from 'express';
import session from 'express-session';
import profileRoutes from '../../routes/profile.routes';
import { editPassword, logout } from '../../controllers/profile.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../controllers/profile.controller');
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

// Mock user authentication for testing
app.use((req, _res, next) => {
  req.user = { id: 'testuser123', email: 'testuser@example.com' };
  next();
});

app.use('/profile', profileRoutes);

describe('Profile Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end(); // Close the pool connection
  });

  describe('PUT /profile', () => {
    it('should call editPassword controller', async () => {
      const mockEditPassword = editPassword as jest.Mock;
      mockEditPassword.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Password updated' });
      });

      const response = await request(app).put('/profile').send({
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password updated');
      expect(mockEditPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /profile', () => {
    it('should call logout controller', async () => {
      const mockLogout = logout as jest.Mock;
      mockLogout.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Disconnected' });
      });

      const response = await request(app).post('/profile');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Disconnected');
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
