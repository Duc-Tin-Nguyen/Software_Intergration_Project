import { Router } from 'express';
import * as commentServices from '../controllers/comments.controller';

const router: Router = Router();

router.get('/:movie_id', commentServices.getCommentsById);
router.post('/:movie_id', commentServices.addComment);

export default router;
