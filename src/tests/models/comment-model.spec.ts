import mongoose, { ConnectOptions } from 'mongoose';
import CommentModel from '../../models/commentModel';
import { IComment } from '../../types/comment.types';

describe('Comment Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should throw validation error if required fields are missing', async () => {
    const comment = new CommentModel({});

    let err;
    try {
      await comment.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.movie_id).toBeDefined();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.comment).toBeDefined();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  it('should save a comment with all required fields', async () => {
    const commentData: Partial<IComment> = {
      movie_id: 1,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'Awesome',
      rating: 5,
      downvotes: 0,
      upvotes: 0,
    };

    const comment = new CommentModel(commentData);
    const savedComment = await comment.save();

    expect(savedComment.movie_id).toBe(commentData.movie_id);
    expect(savedComment.username).toBe(commentData.username);
    expect(savedComment.comment).toBe(commentData.comment);
    expect(savedComment.title).toBe(commentData.title);
    expect(savedComment.rating).toBe(commentData.rating);
    expect(savedComment.downvotes).toBe(commentData.downvotes);
    expect(savedComment.upvotes).toBe(commentData.upvotes);
  });

  it('should not save a comment with invalid rating', async () => {
    const commentData: Partial<IComment> = {
      movie_id: 1,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'Awesome',
      rating: 6, // invalid rating, should be between 0 and 5
    };

    const comment = new CommentModel(commentData);

    let err;
    try {
      await comment.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  it('should set default values for upvotes and downvotes', async () => {
    const commentData: Partial<IComment> = {
      movie_id: 1,
      username: 'testuser',
      comment: 'Great movie!',
      title: 'Awesome',
      rating: 4,
    };

    const comment = new CommentModel(commentData);
    const savedComment = await comment.save();

    expect(savedComment.upvotes).toBe(0);
    expect(savedComment.downvotes).toBe(0);
  });
});
