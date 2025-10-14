import { Router } from 'express';
import { loginUser, logout } from '../controllers/authController';

const router = Router();

// Define routes
router.post('/login', loginUser);
router.post('/logout', logout);

export default router;