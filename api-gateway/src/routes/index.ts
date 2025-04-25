import { auth } from "../middleware/authMiddleware";
import authRoutes from "./authRoutes";
import restaurantRoutes from "./restaurantRoutes";
import userRoutes from "./userRoutes";
import { Router } from 'express';

const router = Router();

    
router.use("/auth", authRoutes);
router.use("/restaurant",auth as any, restaurantRoutes);

router.use('/user', userRoutes);

export default router; 