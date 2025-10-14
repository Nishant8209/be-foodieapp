import { Router } from 'express';
import { createProducts, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/productController';

import upload from '../utils/upload';


const router = Router();

router.post('/create', upload.array("images", 5), createProducts);
router.get('/', getAllProducts);
router.get('/:productId',getProductById);
router.put('/:productId', upload.array("images", 5), updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
