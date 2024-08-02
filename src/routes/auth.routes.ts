import { Router } from 'express';
import * as authServices from '../controllers/auth.controller'; 

const router = Router();

router.post('/signup', authServices.signup);
router.post('/login', authServices.signin);
router.get('/me', authServices.getUser);
router.get('/logout', authServices.logout);

export default router;
