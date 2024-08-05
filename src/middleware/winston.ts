import winston from 'winston';

const options = {
  file: {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

interface Stream {
  write(message: string): void;
}

const stream: Stream = {
  write(message: string): void {
    logger.info(message.trim());
  },
};

export default logger;
export { stream };
