const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    name: String,
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
