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
import { addSSEClient, removeSSEClient } from '../utils/sse';

const router = express.Router();

router.post('/order/create', validateOrder, createOrder);

// routes/order-sse.ts
router.get("/order/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    // "Access-Control-Allow-Origin": "*",           // or your RN origin
    // "Access-Control-Allow-Credentials": "true",
  });
  console.log("🔔 New SSE connection established for order updates");
  res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected to order updates" })}\n\n`);

  addSSEClient(res);

  req.on("close", () => {
    removeSSEClient(res);
  });
});
// Add this route alongside your existing /order/stream
router.get("/order/:deliveryBoyId/stream", (req, res) => {
  const deliveryBoyId = req.params.deliveryBoyId;
  
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  
  console.log(`🔔 DeliveryBoy SSE connection: ${deliveryBoyId}`);
  res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected to delivery updates", deliveryBoyId })}\n\n`);

  // Tag the response with deliveryBoyId
  (res as any).deliveryBoyId = deliveryBoyId;
  addSSEClient(res);

  req.on("close", () => {
    removeSSEClient(res);
  });
});


router.get('/order/', getAllOrders);
router.get('/order/:id', getOrderById);
router.put('/order/:id', updateOrder);
router.delete('/order/:id', deleteOrder);
router.get('/order/user/:userId', getOrdersByUserID);
router.get('/order/deliveryboy/:deliveryBoyId', getOrdersByDeliveryBoyID);

export default router;