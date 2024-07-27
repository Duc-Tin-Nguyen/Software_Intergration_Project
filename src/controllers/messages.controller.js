const messageModel = require('../models/messageModel')

const getMessages = async (req, res) => {
  const messages = await messageModel.find({})
  return res.status(200).json(messages)
}

const getMessageById = async (req, res) => {
  const { messageId } = req.params

  try {
    const message = await messageModel.findById(messageId)
    return res.status(200).json(message)
  } catch (error) {
    console.log('Error while getting message from DB', error.message)
    return res.status(500).json({ error: 'Error while getting message' })
  }
}

const addMessage = async (req, res) => {
  const { message } = req.body

  if (!message || !message.name) {
    return res.status(400).json({ error: 'missing information' })
  }

  if (!req.session.user) {
    return res.status(500).json({ error: 'You are not authenticated' })
  }

  message.user = req.session.user._id

  try {
    const messageObj = new messageModel(message)
    await messageObj.save()
    return res.status(200).json(messageObj)
  } catch (error) {
    console.log('Error while adding message to DB', error.message)
    return res.status(500).json({ error: 'Failed to add message' })
  }
}

const editMessage = async (req, res) => {
  const { name } = req.body
  const { messageId } = req.params

  if (!name || !messageId)
    return res.status(400).json({ error: 'missing information' })
  try {
    const message = await messageModel.findByIdAndUpdate(
      messageId,
      {
        name,
      },
      {
        new: true,
      },
    )
    return res.status(200).json(message)
  } catch (error) {
    console.log('Error while updating message', error.message)
    return res.status(500).json({ error: 'Failed to update message' })
  }
}

const deleteMessage = async (req, res) => {
  const { messageId } = req.params

  if (!messageId) return res.status(400).json({ error: 'missing information' })

  try {
    await messageModel.findByIdAndDelete(messageId)
    return res.status(200).json({ message: 'Message deleted' })
  } catch (error) {
    console.log('Error while deleting message', error.message)
    return res.status(500).json({ error: 'Failed to delete message' })
  }
}

module.exports = {
  getMessages,
  getMessageById,
  addMessage,
  editMessage,
  deleteMessage,
}
