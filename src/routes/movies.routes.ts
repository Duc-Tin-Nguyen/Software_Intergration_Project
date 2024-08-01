import { Router } from 'express';
import { getMovies, getTopRatedMovies, getSeenMovies } from '../controllers/movies.controller';

const router: Router = Router();

router.get('/', getMovies);
router.get('/top', getTopRatedMovies);
router.get('/me', getSeenMovies);

export default router;
