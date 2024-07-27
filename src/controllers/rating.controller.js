const pool = require('../boot/database/db_connect')
const logger = require('../middleware/winston')
const statusCodes = require('../constants/statusCodes')
const ratingModel = require('../models/ratingModel')

const addRating = async (req, res) => {
  const { movieId } = req.params
  const { rating } = req.body

  let movie_id = parseInt(movieId)

  if (isNaN(movie_id) || !rating) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' })
  } else {
    try {
      const ratingObj = new ratingModel({
        email: req.user.email,
        movie_id,
        rating, // equivalent of rating: rating
      })

      await ratingObj.save()

      const ratings = await ratingModel.find({}, { rating })

      const averageRating = ratings.reduce(
        (acc, rating) => acc + rating.rating,
        0,
      )

      console.log(averageRating, typeof averageRating)
      await pool.query('UPDATE movies SET rating = $1 WHERE movie_id = $2;', [
        averageRating,
        movie_id,
      ])
      res.status(statusCodes.success).json({ message: 'Rating added' })
    } catch (error) {
      logger.error(error.stack)
      res
        .status(statusCodes.queryError)
        .json({ error: 'Exception occurred while adding rating' })
    }
  }
}

module.exports = {
  addRating,
}
