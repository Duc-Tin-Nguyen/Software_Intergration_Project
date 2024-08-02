import { Pool, PoolConfig, types } from 'pg';
import logger from '../../middleware/winston';

const dbConfig: PoolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 10,
};

let dbConnection: Pool;

function startConnection() {
  // Type parsers here
  types.setTypeParser(1082, (stringValue: string) => {
    return stringValue; // 1082 is for date type
  });

  dbConnection = new Pool(dbConfig);

  dbConnection.connect((err, _client) => {
    if (!err) {
      logger.info('PostgreSQL Connected');
    } else {
      logger.error('PostgreSQL Connection Failed', err);
    }
  });

  dbConnection.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
    startConnection();
  });
}

startConnection();

export default dbConnection;
