const pg = require('pg')
const logger = require('../../middleware/winston')

const db_config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 10,
}

let db_connection

function startConnection() {
  // type parsers here
  pg.types.setTypeParser(1082, function (stringValue) {
    return stringValue // 1082 is for date type
  })

  db_connection = new pg.Pool(db_config)

  db_connection.connect((err, client) => {
    if (!err) {
      logger.info('PostgreSQL Connected')
    } else {
      logger.error('PostgreSQL Connection Failed')
    }
  })

  db_connection.on('error', (err, client) => {
    logger.error('Unexpected error on idle client')
    startConnection()
  })
}

startConnection()

module.exports = db_connection
