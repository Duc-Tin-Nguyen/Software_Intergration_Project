import { Router } from 'express';
import { editPassword, logout } from '../controllers/profile.controller'; 

const router: Router = Router();

// Define the routes
router.put('/', editPassword);
router.post('/', logout);

export default router;
