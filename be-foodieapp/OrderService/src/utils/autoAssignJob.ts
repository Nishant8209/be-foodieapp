
// src/jobs/autoAssignDeliveryBoy.ts
import cron from "node-cron";
import Order from "../models/order";
import { OrderStatus } from "../models/interface";
import { findNearestAvailableDeliveryBoy, setDeliveryBoyStatus } from "../services/deliveryBoyservice";
import { broadcastStatusUpdate, broadcastToDeliveryBoy } from "./sse";

// Run every 1 minute
cron.schedule("*/1 * * * *", async () => {
  console.log("🔁 Auto-assign job running...");

  const pendingOrders = await Order.find({
    orderStatus: {
      $in: [
        OrderStatus.Confirmed,
        OrderStatus.Preparing,
        OrderStatus.ReadyForPickup,
        OrderStatus.OutForDelivery,
      ],
    },
    $or: [{ deliveryBoyId: null }, { deliveryBoyId: { $exists: false } }],
  }).populate("restaurantId");

  console.log("[autoAssign] pendingOrders count:", pendingOrders.length);

  for (const ord of pendingOrders) {
    try {
      const restaurant: any = ord.restaurantId;
      const coords = restaurant?.address?.location?.coordinates as
        | [number, number]
        | undefined;

      console.log("[autoAssign] order", ord._id.toString(), "coords", coords);

      if (!coords || coords.length !== 2) continue;

      const nearestRes = await findNearestAvailableDeliveryBoy(coords);

      if (!nearestRes || nearestRes.status !== "Success" || !nearestRes.data) {
        console.log(
          "[autoAssign] no rider for order",
          ord._id.toString(),
          "status:",
          nearestRes?.status
        );
        continue;
      }

      const rider = nearestRes.data;
      if (!rider?._id) {
        console.log(
          "[autoAssign] rider has no _id for order",
          ord._id.toString()
        );
        continue;
      }

      ord.deliveryBoyId = rider._id as any;
      await ord.save();

      await setDeliveryBoyStatus(rider._id.toString(), "busy");

      // After successful assignment in cron job
      if (ord.deliveryBoyId) {
        // Notify specific delivery boy
        broadcastToDeliveryBoy(ord.deliveryBoyId.toString(), {
          type: "orderAssigned",
          orderId: ord._id.toString(),
          orderStatus: ord.orderStatus,
          restaurantCoords: coords,
        });

        // Existing broadcast
        broadcastStatusUpdate({
          orderId: ord._id.toString(),
          oldStatus: OrderStatus.Confirmed,
          newStatus: ord.orderStatus,
          deliveryBoyId: ord.deliveryBoyId,
          timestamp: new Date().toISOString(),
        });
      }


      console.log(
        `🚴‍♂️ Auto-assigned rider ${rider._id} to order ${ord._id}`
      );
    } catch (err) {
      console.error("Error in auto-assign job:", err);
    }
  }
});
