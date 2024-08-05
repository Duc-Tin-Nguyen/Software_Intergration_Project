import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import { badRequest, queryError, success } from '../constants/statusCodes';
import { EditPasswordRequestBody } from '../types/editPasswordRequestBody';

// Define the type for query result rows
interface User {
  email: string;
  password: string;
}

const editPassword = async (req: Request, res: Response): Promise<Response> => {
  const { oldPassword, newPassword } = req.body as EditPasswordRequestBody;

  if (!oldPassword || !newPassword) {
    return res.status(badRequest).json({ message: 'Missing parameters' });
  }

  if (oldPassword === newPassword) {
    return res
      .status(badRequest)
      .json({ message: 'New password cannot be equal to old password' });
  }

  try {
    // Check if the old password is correct
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
      [req.user.email, oldPassword]
    );

    if (result.rows.length > 0) {
      // Update the password if the old password is correct
      await pool.query(
        "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
        [newPassword, req.user.email]
      );

      return res.status(success).json({ message: 'Password updated' });
    } else {
      return res.status(badRequest).json({ message: 'Incorrect password' });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.stack);
      return res
        .status(queryError)
        .json({ error: 'Exception occurred while updating password' });
    } else {
      logger.error(String(err));
      return res
        .status(queryError)
        .json({ error: 'Unexpected error occurred' });
    }
  }
};

const logout = async (req: Request, res: Response): Promise<Response> => {
  if (req.session.user) {
    delete req.session.user;
  }

  return res.status(success).json({ message: 'Disconnected' });
};

export { editPassword, logout };
