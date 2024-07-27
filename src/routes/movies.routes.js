const router = require('express').Router()

const movieServices = require('../controllers/movies.controller')

router.get('/', movieServices.getMovies)
router.get('/top', movieServices.getTopRatedMovies)
router.get('/me', movieServices.getSeenMovies)

module.exports = router
