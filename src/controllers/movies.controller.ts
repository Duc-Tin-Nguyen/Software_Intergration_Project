import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';

interface Movie {
  type: string;
  movie_id: number;
  [key: string]: any;
}

const getMovies = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.query;

  if (category) {
    const result = await getMoviesByCategory(category as string);
    return res.status(statusCodes.success).json({ movies: result });
  } else {
    try {
      const movies = await pool.query('SELECT * FROM movies GROUP BY type, movie_id;');

      const groupedMovies = movies.rows.reduce((acc: { [key: string]: Movie[] }, movie: Movie) => {
        const { type } = movie;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(movie);
        return acc;
      }, {});

      return res.status(statusCodes.success).json({ movies: groupedMovies });
    } catch (error) {
      logger.error(error.stack);
      return res
        .status(statusCodes.queryError)
        .json({ error: 'Exception occurred while fetching movies' });
    }
  }
};

const getMoviesByCategory = async (category: string): Promise<Movie[]> => {
  try {
    const movies = await pool.query('SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;', [category]);
    return movies.rows;
  } catch (error) {
    logger.error(error.stack);
    throw error;
  }
};

const getTopRatedMovies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await pool.query('SELECT * FROM movies ORDER BY rating DESC LIMIT 10;');
    return res.status(statusCodes.success).json({ movies: movies.rows });
  } catch (error) {
    logger.error(error.stack);
    return res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occurred while fetching top rated movies' });
  }
};

const getSeenMovies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await pool.query(
      'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
      [req.user.email]
    );
    return res.status(statusCodes.success).json({ movies: movies.rows });
  } catch (error) {
    logger.error(error.stack);
    return res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occurred while fetching seen movies' });
  }
};

export { getMovies, getTopRatedMovies, getSeenMovies };
