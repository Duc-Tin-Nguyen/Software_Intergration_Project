import { Router } from 'express';
import { register, login } from '../controllers/users.controller'; 

const router: Router = Router();

// Define the routes
router.post('/register', register);
router.post('/login', login);

export default router;
