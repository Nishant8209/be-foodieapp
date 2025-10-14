import { Router } from 'express';
import restaurantRoutes   from './restaurant';
import productRoutes from './product';


const router = Router();

router.use('/restaurant',restaurantRoutes);
router.use('/products', productRoutes);


export default router;
