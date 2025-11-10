// routes/userRoutes.ts
import express from 'express';
import dotenv from 'dotenv';

import { createProxy } from '../utils/createProxy'
import { auth } from '../middleware/authMiddleware';
import { keycloakAuth } from '../middleware/keycloakAuth';

dotenv.config();
const router = express.Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL as string;


router.use('/', keycloakAuth(["Admin"]) as any, createProxy(ORDER_SERVICE_URL));


export default router;
