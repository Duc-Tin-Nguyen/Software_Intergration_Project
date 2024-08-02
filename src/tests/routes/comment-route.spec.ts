import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose, { ConnectOptions } from 'mongoose';
import commentRoutes from '../../routes/comments.routes';
import CommentModel from '../../models/commentModel';

// Mock CommentModel
jest.mock('../../models/commentModel');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use('/comments', commentRoutes);

describe('Comment Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /comments/:movie_id', () => {
    it('should return 400 if movie_id is not valid', async () => {
      const response = await request(app).get('/comments/invalid_id');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Movie ID missing');
    });

    it('should return comments for a valid movie_id', async () => {
      const movieId = 1;
      const comments = [
        { movie_id: movieId, username: 'user1', comment: 'Great!', title: 'Awesome', rating: 5 },
      ];

      (CommentModel.find as jest.Mock).mockResolvedValue(comments);

      const response = await request(app).get(`/comments/${movieId}`);
      expect(response.status).toBe(200);
      expect(response.body.comments).toEqual(comments);
    });

    it('should return 500 if there is an error while fetching comments', async () => {
      (CommentModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/comments/1');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while fetching comments');
    });
  });

  describe('POST /comments/:movie_id', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/comments/1')
        .send({ username: 'user1', comment: 'Great!' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing parameters');
    });

    it('should save a comment if all required fields are provided', async () => {
      const commentData = {
        movie_id: 1,
        username: 'user1',
        comment: 'Great!',
        title: 'Awesome',
        rating: 5,
      };

      (CommentModel.prototype.save as jest.Mock).mockResolvedValue(commentData);

      const response = await request(app).post('/comments/1').send(commentData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Comment added');
    });

    it('should return 500 if there is an error while adding a comment', async () => {
      (CommentModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/comments/1').send({
        movie_id: 1,
        username: 'user1',
        comment: 'Great!',
        title: 'Awesome',
        rating: 5,
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Exception occurred while adding comment');
    });
  });
});
