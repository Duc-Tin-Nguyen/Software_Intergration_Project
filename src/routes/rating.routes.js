const router = require('express').Router()

const ratingService = require('../controllers/rating.controller')

router.post('/:movieId', ratingService.addRating)

module.exports = router
