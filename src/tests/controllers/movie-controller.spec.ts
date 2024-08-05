import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { getMovies, getTopRatedMovies, getSeenMovies } from '../../controllers/movies.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../boot/database/db_connect');
jest.mock('../../middleware/winston');

const app = express();
app.use(express.json());

interface CustomRequest extends Request {
  user?: { id: string; email: string };
}

// Middleware to mock user email
app.use((req: CustomRequest, _res: Response, next: NextFunction) => {
  if (req.path.startsWith('/movies/me')) {
    if (!req.headers.authorization) {
      req.user = undefined;
    } else {
      req.user = { id: 'testuser123', email: 'testuser@example.com' };
    }
  }
  next();
});

app.get('/movies', getMovies);
app.get('/movies/top', getTopRatedMovies);
app.get('/movies/me', getSeenMovies);

describe('Movie Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /movies', () => {
    it('should return all movies grouped by type', async () => {
      const mockMovies = {
        rows: [
          { type: 'Action', movie_id: 1, title: 'Action Movie 1' },
          { type: 'Action', movie_id: 2, title: 'Action Movie 2' },
          { type: 'Comedy', movie_id: 3, title: 'Comedy Movie 1' },
        ],
      };

      (pool.query as jest.Mock).mockResolvedValue(mockMovies);

      const response = await request(app).get('/movies');

      expect(response.status).toBe(200);
      expect(response.body.movies).toEqual({
        Action: [
          { type: 'Action', movie_id: 1, title: 'Action Movie 1' },
          { type: 'Action', movie_id: 2, title: 'Action Movie 2' },
        ],
        Comedy: [{ type: 'Comedy', movie_id: 3, title: 'Comedy Movie 1' }],
      });
    });

    it('should return a message when no movies are found', async () => {
      const mockMovies = { rows: [] as { type: string; movie_id: number; title: string }[] };
      (pool.query as jest.Mock).mockResolvedValue(mockMovies);

      const response = await request(app).get('/movies');

      expect(response.status).toBe(200);
      expect(response.body.movies).toEqual([]);
      expect(response.body.message).toBe('No movies found');
    });

    it('should handle database errors gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/movies');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while fetching movies');
    });
  });

  describe('GET /movies/top', () => {
    it('should return the top rated movies', async () => {
      const mockMovies = {
        rows: [
          { movie_id: 1, title: 'Top Movie 1', rating: 9.5 },
          { movie_id: 2, title: 'Top Movie 2', rating: 9.0 },
        ],
      };

      (pool.query as jest.Mock).mockResolvedValue(mockMovies);

      const response = await request(app).get('/movies/top');

      expect(response.status).toBe(200);
      expect(response.body.movies).toEqual(mockMovies.rows);
    });

    it('should handle database errors gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/movies/top');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while fetching top rated movies');
    });
  });

  describe('GET /movies/me', () => {
    it('should return the movies seen by the user', async () => {
      const mockMovies = {
        rows: [
          { movie_id: 1, title: 'Seen Movie 1' },
          { movie_id: 2, title: 'Seen Movie 2' },
        ],
      };

      (pool.query as jest.Mock).mockResolvedValue(mockMovies);

      const response = await request(app).get('/movies/me').set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.movies).toEqual(mockMovies.rows);
    });

    it('should return an error when user email is missing', async () => {
      const response = await request(app).get('/movies/me');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User email is missing');
    });

    it('should handle database errors gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/movies/me').set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while fetching seen movies');
    });
  });
});
