const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    movie_id: {
      type: Number,
      required: [true, 'movie is required'],
    },
    username: {
      type: String,
      required: [true, 'username is required'],
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'rating is required'],
    },
    downvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
    upvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
)

module.exports = mongoose.model('Comment', commentSchema)
