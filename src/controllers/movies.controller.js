const pool = require('../boot/database/db_connect')
const logger = require('../middleware/winston')
const statusCodes = require('../constants/statusCodes')

const getMovies = async (req, res) => {
  const { category } = req.query

  if (category) {
    const result = await getMoviesByCategory(category)
    return res.status(statusCodes.success).json({ movies: result })
  } else {
    try {
      const movies = await pool.query(
        'SELECT * FROM movies GROUP BY type, movie_id;',
      )

      const groupedMovies = movies.rows.reduce((acc, movie) => {
        const { type } = movie
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(movie)
        return acc
      }, {})

      return res.status(statusCodes.success).json({ movies: groupedMovies })
    } catch (error) {
      logger.error(error.stack)
      res
        .status(statusCodes.queryError)
        .json({ error: 'Exception occured while fetching movies' })
    }
  }
}

const getMoviesByCategory = async (category) => {
  try {
    const movies = await pool.query(
      'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
      [category],
    )
    return movies.rows
  } catch (error) {
    logger.error(error.stack)
  }
}

const getTopRatedMovies = async (req, res) => {
  try {
    const movies = await pool.query(
      'SELECT * FROM movies ORDER BY rating DESC LIMIT 10;',
    )
    res.status(statusCodes.success).json({ movies: movies.rows })
  } catch (error) {
    logger.error(error.stack)
    res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occured while fetching top rated movies' })
  }
}

const getSeenMovies = async (req, res) => {
  try {
    const movies = await pool.query(
      'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
      [req.user.email],
    )
    res.status(statusCodes.success).json({ movies: movies.rows })
  } catch (error) {
    logger.error(error.stack)
    res
      .status(statusCodes.queryError)
      .json({ error: 'Exception occured while fetching seen movies' })
  }
}

module.exports = {
  getMovies,
  getTopRatedMovies,
  getSeenMovies,
}
