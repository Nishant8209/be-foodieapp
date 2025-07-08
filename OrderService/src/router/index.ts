import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController';
import { validateOrder } from '../middlewares/orderValidations';

const router = express.Router();

router.post('/order/create', validateOrder, createOrder);
router.get('/order/', getAllOrders);
router.get('/order/:id', getOrderById);
router.put('/order/:id', updateOrder);
router.delete('/order/:id', deleteOrder);

export default router;
