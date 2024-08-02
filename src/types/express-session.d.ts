import express from 'express';
import 'express-session';
import { Session } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      _id?: string;
      email?: string;
    };
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}
