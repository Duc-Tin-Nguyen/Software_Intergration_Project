import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import { queryError, success, badRequest } from '../constants/statusCodes';
import ratingModel from '../models/ratingModel';

interface User {
  id: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: User;
}

const addRating = async (req: RequestWithUser, res: Response): Promise<void> => {
  const { movieId } = req.params;
  const { rating } = req.body;

  const movie_id = parseInt(movieId, 10);

  if (isNaN(movie_id) || !rating) {
    res.status(badRequest).json({ message: 'Missing parameters' });
  } else {
    try {
      const ratingObj = new ratingModel({
        email: req.user.email,
        movie_id,
        rating,
      });

      await ratingObj.save();

      const ratings = await ratingModel.find({}, { rating: 1, _id: 0 });

      const averageRating = ratings.reduce((acc: number, { rating }: { rating: number }) => acc + rating, 0) / ratings.length;

      await pool.query('UPDATE movies SET rating = $1 WHERE movie_id = $2;', [
        averageRating,
        movie_id,
      ]);
      
      res.status(success).json({ message: 'Rating added' });
    } catch (error) {
      logger.error(error.stack || error.message);
      res.status(queryError).json({ error: 'Exception occurred while adding rating' });
    }
  }
};

export { addRating };
