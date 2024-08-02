import express from 'express';

declare module 'express-session' {
  interface SessionData {
    user: {
      _id: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
    }
  }
}
