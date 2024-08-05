import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import { badRequest, queryError, success, notFound, userAlreadyExists } from '../constants/statusCodes';
import jwt from 'jsonwebtoken';
import { RegisterRequestBody, LoginRequestBody } from '../types/authRequestBody';
import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      _id: string;
      email: string;
    };
  }
}

// Define types for query results
interface User {
  email: string;
  username: string;
}

// Define a generic interface for query results to improve type safety
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

const register = async (req: Request<object, unknown, RegisterRequestBody>, res: Response): Promise<void> => {
  const { email, username, password, country, city, street, creation_date } = req.body;

  if (!email || !username || !password || !country) {
    res.status(badRequest).json({ message: 'Missing parameters' });
    return;
  }

  const client = await pool.connect();

  try {
    const result: QueryResult<User> = await client.query('SELECT * FROM users WHERE email = $1;', [email]);

    if (result.rowCount > 0) {
      res.status(userAlreadyExists).json({ message: 'User already has an account' });
    } else {
      await client.query('BEGIN');

      const addedUser = await client.query(
        `INSERT INTO users(email, username, password, creation_date)
         VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`,
        [email, username, password, creation_date]
      );

      logger.info('USER ADDED', addedUser.rowCount);

      const address = await client.query(
        `INSERT INTO addresses(email, country, street, city) VALUES ($1, $2, $3, $4);`,
        [email, country, street, city]
      );

      logger.info('ADDRESS ADDED', address.rowCount);

      res.status(success).json({ message: 'User created' });
      await client.query('COMMIT');
    }
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (error instanceof Error) {
      logger.error(error.stack);
      res.status(queryError).json({ message: 'Exception occurred while registering' });
    } else {
      logger.error('Unknown error occurred');
      res.status(queryError).json({ message: 'Exception occurred while registering' });
    }
  } finally {
    client.release();
  }
};

const login = async (req: Request<object, unknown, LoginRequestBody> & { session: SessionData }, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(badRequest).json({ message: 'Missing parameters' });
    return;
  }

  try {
    const result: QueryResult<User> = await pool.query(
      'SELECT email, username FROM users WHERE email = $1 AND password = crypt($2, password);',
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      req.session.user = {
        _id: user.email,
        email: user.email,
      };

      const token = jwt.sign(
        { user: { _id: user.email, email: user.email } },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '1h' }
      );

      res.status(success).json({ token, username: user.username });
    } else {
      res.status(notFound).json({ message: 'Incorrect email/password' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.stack);
      res.status(queryError).json({ message: 'Exception occurred while logging in' });
    } else {
      logger.error('Unknown error occurred');
      res.status(queryError).json({ message: 'Exception occurred while logging in' });
    }
  }
};

export { register, login };
