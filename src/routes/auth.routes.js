const express = require('express')
const router = express.Router()

const authServices = require('../controllers/auth.controller')

router.post('/signup', authServices.signup)
router.post('/login', authServices.signin)
router.get('/me', authServices.getUser)
router.get('/logout', authServices.logout)

module.exports = router
