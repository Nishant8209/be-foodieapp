import { getIO } from "./socket";

// Emit order updates to web user, admin, delivery
export const emitOrderStatus = (order: any, oldStatus?: string) => {
  const io = getIO();

  // Admin room → all updates
  io.to("admin").emit("orderStatusUpdate", { order, oldStatus });
    console.log('orderStatusUpdate',order,oldStatus)
  // User → specific order
  io.to(`user:${order.userId}`).emit("orderStatusUpdate", { order, oldStatus });

  // Delivery boy → only assigned
  if (order.deliveryBoyId) {
    io.to(`deliveryBoy:${order.deliveryBoyId}`).emit("orderStatusUpdate", {
      order,
      oldStatus,
    });
  }
};

// Emit new assignment to delivery boy
export const emitOrderAssigned = (order: any) => {
  if (!order.deliveryBoyId) return;
  const io = getIO();
  io.to(`deliveryBoy:${order.deliveryBoyId}`).emit("orderAssigned", { order });
};
