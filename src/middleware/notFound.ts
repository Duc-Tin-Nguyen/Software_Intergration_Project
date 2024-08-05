import { Request, Response } from 'express';

const notFound = (_req: Request, res: Response): void => {
  const err = new Error('Not Found');
  res.status(404).json({
    error: {
      message: err.message,
    },
  });
};

export default notFound;
