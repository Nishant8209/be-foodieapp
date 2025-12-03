import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserID,
  getOrdersByDeliveryBoyID,
} from '../controllers/orderController';
import { validateOrder } from '../middlewares/orderValidations';
import { get } from 'http';

const router = express.Router();

router.post('/order/create', validateOrder, createOrder);
router.get('/order/', getAllOrders);
router.get('/order/:id', getOrderById);
router.put('/order/:id', updateOrder);
router.delete('/order/:id', deleteOrder);
router.get('/order/user/:userId', getOrdersByUserID);
router.get('/order/deliveryboy/:deliveryBoyId',getOrdersByDeliveryBoyID);

export default router;