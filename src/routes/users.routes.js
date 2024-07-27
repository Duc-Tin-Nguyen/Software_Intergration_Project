const router = require('express').Router()

const userServices = require('../controllers/users.controller')

router.post('/register', userServices.register)
router.post('/login', userServices.login)

module.exports = router
