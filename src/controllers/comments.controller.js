const logger = require('../middleware/winston')
const statusCodes = require('../constants/statusCodes')
const commentModel = require('../models/commentModel')

const addComment = async (req, res) => {
  const { movie_id } = req.params
  const { rating, username, comment, title } = req.body

  let movieId = parseInt(movie_id)

  if (
    !movie_id ||
    isNaN(movieId) ||
    !rating ||
    !username ||
    !comment ||
    !title
  ) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' })
  } else {
    try {
      const commentObj = new commentModel({
        movie_id: movieId,
        rating,
        username,
        comment,
        title,
      })

      await commentObj.save()

      res.status(statusCodes.success).json({ message: 'Comment added' })
    } catch (error) {
      logger.error(error.stack)
      res
        .status(statusCodes.queryError)
        .json({ error: 'Exception occurred while adding comment' })
    }
  }
}

const getCommentsById = async (req, res) => {
  const { movie_id } = req.params

  let movieId = parseInt(movie_id)

  if (!movie_id || isNaN(movieId)) {
    res.status(statusCodes.badRequest).json({ message: 'movie id missing' })
  } else {
    try {
      const comments = await commentModel.find({ movie_id: movieId })
      res.status(statusCodes.success).json({ comments })
    } catch (error) {
      logger.error(error.stack)
      res
        .status(statusCodes.queryError)
        .json({ error: 'Exception occured while fetching comments' })
    }
  }
}

module.exports = {
  getCommentsById,
  addComment,
}
