import winston from 'winston';
import logger from '../../middleware/winston';

describe('Winston Logger', () => {
  it('should create a logger with file and console transports', () => {
    const transports = logger.transports;

    const fileTransport = transports.find(
      (transport) => transport instanceof winston.transports.File
    ) as winston.transports.FileTransportInstance;
    const consoleTransport = transports.find(
      (transport) => transport instanceof winston.transports.Console
    ) as winston.transports.ConsoleTransportInstance;

    expect(fileTransport).toBeDefined();
    expect(consoleTransport).toBeDefined();
  });

  it('should write logs to file transport', () => {
    const fileTransport = logger.transports.find(
      (transport) => transport instanceof winston.transports.File
    ) as winston.transports.FileTransportInstance;

    const logSpy = jest.spyOn(fileTransport, 'log');

    logger.info('Test log for file transport');

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'Test log for file transport',
      }),
      expect.any(Function)
    );
  });

  it('should handle stream write method correctly', () => {
    const logSpy = jest.spyOn(logger, 'info');

    (logger as any).stream.write('Test stream message', 'utf-8');

    expect(logSpy).toHaveBeenCalledWith('Test stream message');
  });
});
