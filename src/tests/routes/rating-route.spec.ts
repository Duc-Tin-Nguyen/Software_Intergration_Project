import request from 'supertest';
import express from 'express';
import ratingRoutes from '../../routes/rating.routes';
import { addRating } from '../../controllers/rating.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../controllers/rating.controller');
jest.mock('../../boot/database/db_connect');

const app = express();
app.use(express.json());
app.use('/ratings', ratingRoutes);

describe('Rating Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Ensure all database connections are properly closed
    if (typeof pool.end === 'function') {
      await pool.end();
    }
  });

  describe('POST /ratings/:movieId', () => {
    it('should call addRating controller', async () => {
      const mockAddRating = addRating as jest.Mock;
      mockAddRating.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Rating added successfully' });
      });

      const response = await request(app)
        .post('/ratings/1')
        .send({ rating: 4 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Rating added successfully');
      expect(mockAddRating).toHaveBeenCalledTimes(1);
    });

    it('should handle missing parameters', async () => {
      const mockAddRating = addRating as jest.Mock;
      mockAddRating.mockImplementation((_req, res) => {
        res.status(400).json({ message: 'Missing parameters' });
      });

      const response = await request(app)
        .post('/ratings/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing parameters');
      expect(mockAddRating).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid movieId parameter', async () => {
      const mockAddRating = addRating as jest.Mock;
      mockAddRating.mockImplementation((_req, res) => {
        res.status(400).json({ message: 'Invalid movieId parameter' });
      });

      const response = await request(app)
        .post('/ratings/invalid')
        .send({ rating: 4 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid movieId parameter');
      expect(mockAddRating).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      const mockAddRating = addRating as jest.Mock;
      mockAddRating.mockImplementation((_req, res) => {
        res.status(500).json({ error: 'Exception occurred while adding rating' });
      });

      const response = await request(app)
        .post('/ratings/1')
        .send({ rating: 4 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while adding rating');
      expect(mockAddRating).toHaveBeenCalledTimes(1);
    });
  });
});
