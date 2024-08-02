import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import { badRequest, queryError, success } from '../constants/statusCodes';
import { EditPasswordRequestBody } from '../types/editPasswordRequestBody';

const editPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body as EditPasswordRequestBody;

  if (!oldPassword || !newPassword) {
    res.status(badRequest).json({ message: 'Missing parameters' });
  } else {
    if (oldPassword === newPassword) {
      res
        .status(badRequest)
        .json({ message: 'New password cannot be equal to old password' });
    } else {
      pool.query(
        'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
        [req.user.email, oldPassword],
        (err: Error, result: { rows: any[] }) => {
          if (err) {
            logger.error(err.stack);
            res
              .status(queryError)
              .json({ error: 'Exception occurred while updating password' });
          } else {
            if (result.rows[0]) {
              pool.query(
                "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
                [newPassword, req.user.email],
                (err: Error) => {
                  if (err) {
                    logger.error(err.stack);
                    res.status(queryError).json({
                      error: 'Exception occurred while updating password',
                    });
                  } else {
                    res
                      .status(success)
                      .json({ message: 'Password updated' });
                  }
                }
              );
            } else {
              res
                .status(badRequest)
                .json({ message: 'Incorrect password' });
            }
          }
        }
      );
    }
  }
};

const logout = async (req: Request, res: Response) => {
  if (req.session.user) {
    delete req.session.user;
  }

  return res.status(success).json({ message: 'Disconnected' });
};

export { editPassword, logout };
