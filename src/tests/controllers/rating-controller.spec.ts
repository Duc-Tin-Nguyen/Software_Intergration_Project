import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { addRating } from '../../controllers/rating.controller';
import pool from '../../boot/database/db_connect';
import ratingModel from '../../models/ratingModel'; // Assuming ratingModel has a named export for its type
import { queryError, success, badRequest } from '../../constants/statusCodes';

jest.mock('../../boot/database/db_connect');
jest.mock('../../models/ratingModel');
jest.mock('../../middleware/winston');

const app = express();
app.use(express.json());

interface User {
  id: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: User;
}

// Middleware to mock user authentication for testing
app.use((req: RequestWithUser, _res: Response, next: NextFunction) => {
  req.user = { id: 'testuser123', email: 'testuser@example.com' };
  next();
});

app.post('/ratings/:movieId', addRating);

describe('Rating Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a rating successfully', async () => {
    const mockRating = { email: 'testuser@example.com', movie_id: 1, rating: 4 };

    (ratingModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockRating),
    }));
    (ratingModel.find as jest.Mock).mockResolvedValue([{ rating: 4 }, { rating: 5 }]);

    (pool.query as jest.Mock).mockResolvedValueOnce({});

    const response = await request(app)
      .post('/ratings/1')
      .send({ rating: 4 });

    console.log(response.body); // Add this line for debugging

    expect(response.status).toBe(success);
    expect(response.body.message).toBe('Rating added');
  });

  it('should return an error when missing parameters', async () => {
    const response = await request(app)
      .post('/ratings/1')
      .send({});

    expect(response.status).toBe(badRequest);
    expect(response.body.message).toBe('Missing parameters');
  });

  it('should handle invalid movieId parameter', async () => {
    const response = await request(app)
      .post('/ratings/invalid')
      .send({ rating: 4 });

    expect(response.status).toBe(badRequest);
    expect(response.body.message).toBe('Missing parameters');
  });

  it('should handle database errors gracefully', async () => {
    (ratingModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Database error')),
    }));

    const response = await request(app)
      .post('/ratings/1')
      .send({ rating: 4 });

    expect(response.status).toBe(queryError);
    expect(response.body.error).toBe('Exception occurred while adding rating');
  });
});
