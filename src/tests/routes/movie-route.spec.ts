import request from 'supertest';
import express from 'express';
import movieRoutes from '../../routes/movies.routes';
import { getMovies, getTopRatedMovies, getSeenMovies } from '../../controllers/movies.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../controllers/movies.controller');
jest.mock('../../boot/database/db_connect');

const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

describe('Movie Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Ensure all database connections are properly closed
    if (typeof pool.end === 'function') {
      await pool.end();
    }
  });

  describe('GET /movies', () => {
    it('should call getMovies controller', async () => {
      const mockGetMovies = getMovies as jest.Mock;
      mockGetMovies.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Movies fetched successfully' });
      });

      const response = await request(app).get('/movies');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Movies fetched successfully');
      expect(mockGetMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /movies/top', () => {
    it('should call getTopRatedMovies controller', async () => {
      const mockGetTopRatedMovies = getTopRatedMovies as jest.Mock;
      mockGetTopRatedMovies.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Top rated movies fetched successfully' });
      });

      const response = await request(app).get('/movies/top');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Top rated movies fetched successfully');
      expect(mockGetTopRatedMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /movies/me', () => {
    it('should call getSeenMovies controller', async () => {
      const mockGetSeenMovies = getSeenMovies as jest.Mock;
      mockGetSeenMovies.mockImplementation((_req, res) => {
        res.status(200).json({ message: 'Seen movies fetched successfully' });
      });

      const response = await request(app).get('/movies/me');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seen movies fetched successfully');
      expect(mockGetSeenMovies).toHaveBeenCalledTimes(1);
    });
  });
});
