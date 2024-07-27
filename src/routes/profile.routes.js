const router = require('express').Router()

const profileServices = require('../controllers/profile.controller')

router.put('/', profileServices.editPassword)
router.post('/', profileServices.logout)

module.exports = router
