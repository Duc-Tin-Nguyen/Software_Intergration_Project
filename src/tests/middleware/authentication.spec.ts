import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import verifyToken from '../../middleware/authentication';
import { unauthorized } from '../../constants/statusCodes';
import logger from '../../middleware/winston';

// Mock the dependencies
jest.mock('jsonwebtoken');
jest.mock('../../middleware/winston');

describe('verifyToken Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    (req.header as jest.Mock).mockReturnValue(null);

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorized);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    (req.header as jest.Mock).mockReturnValue('Bearer invalidtoken');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    verifyToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorized);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(new Error('Invalid token'));
  });

  it('should call next if token is valid', () => {
    const decodedToken = { user: { id: 'testUserId', email: 'testuser@example.com' } };
    (req.header as jest.Mock).mockReturnValue('Bearer validtoken');
    (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

    verifyToken(req as Request, res as Response, next);

    expect(req.user).toEqual(decodedToken.user);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
