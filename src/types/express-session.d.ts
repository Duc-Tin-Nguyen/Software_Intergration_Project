import 'express';

declare module 'express-session' {
  interface SessionData {
    user: { _id: string };
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}
