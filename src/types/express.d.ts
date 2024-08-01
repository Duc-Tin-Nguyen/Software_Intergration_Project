import { User } from './user';
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User; 
    }
  }
}
