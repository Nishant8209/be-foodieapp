// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'
import { auth } from '../middleware/authMiddleware';

dotenv.config();
const router = express.Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL as string;

router.use('/',auth as any, createProxy(PRODUCT_SERVICE_URL));

export default router;
