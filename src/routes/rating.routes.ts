import { Router } from 'express';
import { addRating } from '../controllers/rating.controller';

const router: Router = Router();

router.post('/:movieId', addRating);

export default router;
