import { Router } from 'express';
import ratingService from '../controllers/rating.controller';

const router: Router = Router();

router.post('/:movieId', ratingService.addRating);

export default router;
