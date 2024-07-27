const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'missing information' })
  }

  const hash = bcrypt.hashSync(password, 10)

  try {
    const User = new userModel({
      email, // equivalent of writing email: email
      username,
      password: hash,
    })
    const user = await User.save()
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: 'failed to save user' })
  }
}

const signin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'missing information' })
  }

  try {
    const user = await userModel.findOne({ email: email })

    console.log(process.env.JWT_SECRET_KEY)
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Email or password don't match" })
    }

    req.session.user = {
      _id: user._id,
    }

    const token = jwt.sign(
      { user: { id: user._id, email: user.email } },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1h',
      },
    )

    return res.status(200).json({ token })
  } catch (error) {
    console.log('Error while getting user from DB', error.message)
    return res.status(500).json({ error: 'Failed to get user' })
  }
}

const getUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(500).json({ error: 'You are not authenticated' })
  }

  try {
    const user = await userModel
      .findById(req.session.user._id, {
        password: 0,
      })
      .populate('messages')

    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.log('Error while getting user from DB', error.message)
    return res.status(500).json({ error: 'Failed to get user' })
  }
}

const logout = (req, res) => {
  if (req.session.user) {
    delete req.session.user
  }

  return res.status(200).json({ message: 'Disconnected' })
}

module.exports = {
  signup,
  signin,
  getUser,
  logout,
}
