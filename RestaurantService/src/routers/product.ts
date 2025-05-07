import { Router } from 'express';
import { productController } from '../controllers/productController';


const router = Router();


router.post('/create', productController.createProduct);
router.get('/', productController.getAllProducts);
router.delete('/:productId', productController.deleteProduct);
router.put('/:productId', productController.updateProduct); 

export default router;
