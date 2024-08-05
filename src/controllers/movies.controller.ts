import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import { queryError, success } from '../constants/statusCodes';

interface Movie {
  type: string;
  movie_id: number;
  title?: string; // Example of a more specific property
  release_date?: Date;
  rating?: number;
  [key: string]: string | number | Date | undefined; // More precise types
}

const getMovies = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.query as { category?: string };

  if (category) {
    const result = await getMoviesByCategory(category);
    if (result.length === 0) {
      return res.status(success).json({ movies: [], message: 'No movies found in this category' });
    }
    return res.status(success).json({ movies: result });
  } else {
    try {
      const movies = await pool.query('SELECT * FROM movies GROUP BY type, movie_id;');

      if (movies.rows.length === 0) {
        return res.status(success).json({ movies: [], message: 'No movies found' });
      }

      const groupedMovies = movies.rows.reduce((acc: { [key: string]: Movie[] }, movie: Movie) => {
        const { type } = movie;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(movie);
        return acc;
      }, {});

      return res.status(success).json({ movies: groupedMovies });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error while fetching movies: ${error.stack}`);
      } else {
        logger.error(`Unknown error while fetching movies: ${String(error)}`);
      }
      return res
        .status(queryError)
        .json({ error: 'Exception occurred while fetching movies' });
    }
  }
};

const getMoviesByCategory = async (category: string): Promise<Movie[]> => {
  try {
    const movies = await pool.query('SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;', [category]);
    return movies.rows;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error while fetching movies by category: ${error.stack}`);
    } else {
      logger.error(`Unknown error while fetching movies by category: ${String(error)}`);
    }
    throw error;
  }
};

const getTopRatedMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await pool.query('SELECT * FROM movies ORDER BY rating DESC LIMIT 10;');
    return res.status(success).json({ movies: movies.rows });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error while fetching top-rated movies: ${error.stack}`);
    } else {
      logger.error(`Unknown error while fetching top-rated movies: ${String(error)}`);
    }
    return res
      .status(queryError)
      .json({ error: 'Exception occurred while fetching top-rated movies' });
  }
};

const getSeenMovies = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: 'User email is missing' });
    }

    const email = req.user.email;

    const movies = await pool.query(
      'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
      [email]
    );
    return res.status(success).json({ movies: movies.rows });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error while fetching seen movies: ${error.stack}`);
    } else {
      logger.error(`Unknown error while fetching seen movies: ${String(error)}`);
    }
    return res
      .status(queryError)
      .json({ error: 'Exception occurred while fetching seen movies' });
  }
};

export { getMovies, getTopRatedMovies, getSeenMovies };
