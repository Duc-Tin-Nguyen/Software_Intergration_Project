import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import session from 'express-session';
import morgan from 'morgan';
import logger from '../middleware/winston';
import notFound from '../middleware/notFound';
import healthCheck from '../middleware/healthCheck';
import verifyToken from '../middleware/authentication';
import validator from '../middleware/validator';
import dotenv from 'dotenv';

// Load environment variables from .env.dev file
dotenv.config({ path: '.env.dev' });

// ROUTES
import authRoutes from '../routes/auth.routes';
import messageRoutes from '../routes/messages.routes';
import usersRoutes from '../routes/users.routes';
import profileRoutes from '../routes/profile.routes';
import moviesRoutes from '../routes/movies.routes';
import ratingRoutes from '../routes/rating.routes';
import commentsRoutes from '../routes/comments.routes';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const app: Application = express();

try {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/epita');
  logger.info('MongoDB Connected');
} catch (error: any) {
  logger.error('Error connecting to DB' + error);
}

// MIDDLEWARE
const registerCoreMiddleWare = (): void => {
  try {
    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
        },
      })
    );

    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim())
      }
    }));
    app.use(express.json()); // returning middleware that only parses JSON
    app.use(cors()); // enabling CORS
    app.use(helmet()); // enabling helmet -> setting response headers

    app.use(validator);
    app.use(healthCheck);

    app.use('/auth', authRoutes);
    app.use('/users', usersRoutes);

    // Route registration
    app.use('/messages', verifyToken, messageRoutes);
    app.use('/profile', verifyToken, profileRoutes);
    app.use('/movies', verifyToken, moviesRoutes);
    app.use('/ratings', verifyToken, ratingRoutes);
    app.use('/comments', verifyToken, commentsRoutes);

    // 404 handling for not found
    app.use(notFound);

    logger.http('Done registering all middlewares');
  } catch (err: any) {
    logger.error('Error thrown while executing registerCoreMiddleWare');
    process.exit(1);
  }
};

// handling uncaught exceptions
const handleError = (): void => {
  process.on('uncaughtException', (err: any) => {
    logger.error(`UNCAUGHT_EXCEPTION OCCURRED: ${JSON.stringify(err.stack)}`);
  });
};

// start application
const startApp = (): void => {
  try {
    // register core application level middleware
    registerCoreMiddleWare();

    app.listen(PORT, () => {
      logger.info('Listening on 127.0.0.1:' + PORT);
    });

    // exit on uncaught exception
    handleError();
  } catch (err: any) {
    logger.error(
      `startup :: Error while booting the application ${JSON.stringify(
        err,
        undefined,
        2
      )}`
    );
    throw err;
  }
};

export { startApp };
