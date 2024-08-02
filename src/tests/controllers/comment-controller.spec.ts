import request from 'supertest';
import express from 'express';
import { addComment, getCommentsById } from '../../controllers/comments.controller';
import logger from '../../middleware/winston';
import CommentModel from '../../models/commentModel';
import { badRequest, queryError, success } from '../../constants/statusCodes';

// Mock the dependencies
jest.mock('../../models/commentModel');
jest.mock('../../middleware/winston');

const app = express();
app.use(express.json());

app.post('/comments/:movie_id', addComment);
app.get('/comments/:movie_id', getCommentsById);

describe('Comment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /comments/:movie_id', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/comments/1').send({
        rating: 5,
        username: 'testuser',
        comment: 'Great movie!',
      });

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Missing parameters');
    });

    it('should return 200 and add the comment if all required fields are provided', async () => {
      (CommentModel.prototype.save as jest.Mock).mockResolvedValue({});

      const response = await request(app).post('/comments/1').send({
        rating: 5,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'Awesome',
      });

      expect(response.status).toBe(success);
      expect(response.body.message).toBe('Comment added');
      expect(CommentModel.prototype.save).toHaveBeenCalled();
    });

    it('should return 500 if there is an error saving the comment', async () => {
      (CommentModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/comments/1').send({
        rating: 5,
        username: 'testuser',
        comment: 'Great movie!',
        title: 'Awesome',
      });

      expect(response.status).toBe(queryError);
      expect(response.body.error).toBe('Exception occurred while adding comment');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('GET /comments/:movie_id', () => {
    it('should return 400 if movie_id is missing or invalid', async () => {
      const response = await request(app).get('/comments/invalid');

      expect(response.status).toBe(badRequest);
      expect(response.body.message).toBe('Movie ID missing');
    });

    it('should return 200 and the comments for the given movie_id', async () => {
      const comments = [
        { movie_id: 1, rating: 5, username: 'testuser', comment: 'Great movie!', title: 'Awesome' },
      ];
      (CommentModel.find as jest.Mock).mockResolvedValue(comments);

      const response = await request(app).get('/comments/1');

      expect(response.status).toBe(success);
      expect(response.body.comments).toEqual(comments);
    });

    it('should return 500 if there is an error fetching the comments', async () => {
      (CommentModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/comments/1');

      expect(response.status).toBe(queryError);
      expect(response.body.error).toBe('Exception occurred while fetching comments');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
