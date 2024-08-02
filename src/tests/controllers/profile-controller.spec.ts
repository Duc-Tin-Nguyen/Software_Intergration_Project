import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { editPassword, logout } from '../../controllers/profile.controller';
import pool from '../../boot/database/db_connect';
import { badRequest, queryError, success } from '../../constants/statusCodes';

jest.mock('../../boot/database/db_connect');
jest.mock('../../middleware/winston');

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

app.post('/edit-password', editPassword);
app.post('/logout', logout);

describe('Profile Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('editPassword', () => {
    it('should return missing parameters error', async () => {
      const response = await request(app).post('/edit-password').send({});
      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
    });

    it('should return error if new password is equal to old password', async () => {
      const response = await request(app)
        .post('/edit-password')
        .send({ oldPassword: 'password', newPassword: 'password' });
      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('New password cannot be equal to old password');
    });

    it('should return incorrect password error', async () => {
      (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
        callback(null, { rows: [] });
      });

      const response = await request(app)
        .post('/edit-password')
        .send({ oldPassword: 'wrongPassword', newPassword: 'newPassword' });
      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Incorrect password');
    });

    it('should return query error when selecting user', async () => {
      const error = new Error('Query error');
      (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
        callback(error, null);
      });

      const response = await request(app)
        .post('/edit-password')
        .send({ oldPassword: 'password', newPassword: 'newPassword' });
      expect(response.status).toBe(queryError);
      expect(response.body.error).toBe('Exception occurred while updating password');
    });

    it('should return query error when updating password', async () => {
      (pool.query as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
        callback(null, { rows: [{ email: 'testuser@example.com' }] });
      });
      (pool.query as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
        callback(new Error('Query error'), null);
      });

      const response = await request(app)
        .post('/edit-password')
        .send({ oldPassword: 'password', newPassword: 'newPassword' });
      expect(response.status).toBe(queryError);
      expect(response.body.error).toBe('Exception occurred while updating password');
    });

    it('should update the password successfully', async () => {
      (pool.query as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
        callback(null, { rows: [{ email: 'testuser@example.com' }] });
      });
      (pool.query as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
        callback(null, {});
      });

      const response = await request(app)
        .post('/edit-password')
        .send({ oldPassword: 'password', newPassword: 'newPassword' });
      expect(response.status).toBe(success);
      expect(response.body.message).toBe('Password updated');
    });
  });

  describe('logout', () => {
    it('should logout the user successfully', async () => {
      const response = await request(app).post('/logout');
      expect(response.status).toBe(success);
      expect(response.body.message).toBe('Disconnected');
    });
  });
});
