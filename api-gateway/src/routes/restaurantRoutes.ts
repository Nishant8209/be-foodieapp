// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'
import { auth } from '../middleware/authMiddleware';

dotenv.config();
const router = express.Router();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL as string;
router.use('/create', createProxy(RESTAURANT_SERVICE_URL));
router.use(auth as any);
router.use('/', createProxy(RESTAURANT_SERVICE_URL));

export default router;
