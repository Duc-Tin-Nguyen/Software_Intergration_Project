import { Request, Response } from 'express';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';
import CommentModel from '../models/commentModel';
import { AddCommentBody } from '../types/comment'; 

const addComment = async (req: Request, res: Response): Promise<void> => {
  const { movie_id } = req.params;
  const { rating, username, comment, title }: AddCommentBody = req.body;

  const movieId = parseInt(movie_id);

  if (!movie_id || isNaN(movieId) || !rating || !username || !comment || !title) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' });
  } else {
    try {
      const commentObj = new CommentModel({
        movie_id: movieId,
        rating,
        username,
        comment,
        title,
      });

      await commentObj.save();
      res.status(statusCodes.success).json({ message: 'Comment added' });
    } catch (error) {
      logger.error(error.stack || error.message);
      res.status(statusCodes.queryError).json({ error: 'Exception occurred while adding comment' });
    }
  }
};

const getCommentsById = async (req: Request, res: Response): Promise<void> => {
  const { movie_id } = req.params;
  const movieId = parseInt(movie_id);

  if (!movie_id || isNaN(movieId)) {
    res.status(statusCodes.badRequest).json({ message: 'Movie ID missing' });
  } else {
    try {
      const comments = await CommentModel.find({ movie_id: movieId });
      res.status(statusCodes.success).json({ comments });
    } catch (error) {
      logger.error(error.stack || error.message);
      res.status(statusCodes.queryError).json({ error: 'Exception occurred while fetching comments' });
    }
  }
};

export {
  getCommentsById,
  addComment,
};
