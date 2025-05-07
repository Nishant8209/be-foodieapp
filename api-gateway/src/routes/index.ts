import { auth } from "../middleware/authMiddleware";
import authRoutes from "./authRoutes";
import restaurantRoutes from "./restaurantRoutes";
import userRoutes from "./userRoutes";
import { Router } from 'express';
import productsRoutes from './productRoutes'
const router = Router();

    
router.use("/auth", authRoutes);
router.use("/restaurant", restaurantRoutes);
router.use("/products", productsRoutes);
router.use('/user', userRoutes);

export default router; 