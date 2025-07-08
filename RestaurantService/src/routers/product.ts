import { Router } from 'express';
import { createProducts, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/productController';


const router = Router();


router.post('/create', createProducts);
router.get('/', getAllProducts);
router.delete('/:productId', deleteProduct);
router.put('/:productId', updateProduct); 
router.get('/:productId',getProductById); // Assuming you want to get a product by ID as well

export default router;
