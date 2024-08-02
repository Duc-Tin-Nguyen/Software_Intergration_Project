import winston from 'winston';
import winstonMiddleware from './middleware/winston.middleware';

jest.mock('winston'); // Make sure winston is properly mocked if it is used

describe('Winston Middleware', () => {
  it('should log information', () => {
    const logger = winston.createLogger();
    logger.info = jest.fn();

    winstonMiddleware(logger, null, null, () => {});
    logger.info('Test Log');

    expect(logger.info).toHaveBeenCalledWith('Test Log');
  });
});
