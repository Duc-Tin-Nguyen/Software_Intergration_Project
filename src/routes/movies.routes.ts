import { Router } from 'express';
import movieServices from '../controllers/movies.controller';

const router: Router = Router();

router.get('/', movieServices.getMovies);
router.get('/top', movieServices.getTopRatedMovies);
router.get('/me', movieServices.getSeenMovies);

export default router;
