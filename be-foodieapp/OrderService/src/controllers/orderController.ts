import { Request, Response } from "express";
import * as OrderService from "../services/orderService";
import axios, { all } from "axios";
import mongoose from "mongoose";
import {
  errorResponse,
  failResponse,
  successResponse,
} from "../utils/response";
import { StatusCode } from "../utils/StatusCodes";
import { getAllOrdersService } from "../services/orderService";
import {
  buildFilter,
  buildProductAggregationPipeline,
} from "../utils/orderFilters";
import order from "../models/order";
import {
  allowedOrderStatus,
  Messages,
  orderAllowedUpdates,
  validOrderSequence,
} from "../utils/constants";
import { OrderStatus } from "../models/interface";
import {
  assignDeliveryBoy,
  findNearestAvailableDeliveryBoy,
  releaseDeliveryBoy,
} from "../services/deliveryBoyservice";
import { broadcastStatusUpdate } from "../utils/sse";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const { userId, restaurantId } = orderData;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return failResponse(res, "Invalid userId format", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return failResponse(res, "Invalid restaurantId format", 400);
    }

    const userServiceUrl = process.env.USER_SERVICE_URL;
    const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL;

    // 2. Validate user existence
    try {
      await axios.get(`${userServiceUrl}/${userId}`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
    } catch {
      return failResponse(res, "User not found", 404);
    }

    // 3. Validate restaurant existence
    try {
      await axios.get(`${restaurantServiceUrl}/${restaurantId}`, {
        headers: {
          Authorization: req.headers.authorization || "",
        },
      });
    } catch {
      return failResponse(res, "Restaurant not found", 404);
    }

    // 4. Create order
    const order = await OrderService.createOrder(orderData);
    return successResponse(
      res,
      order,
      Messages.OrderCreated,
      StatusCode.Created
    );
  } catch (error: any) {
    console.error("Order creation error:", error.message);
    return errorResponse(
      res,
      Messages.Fail,
      StatusCode.Internal_Server_Error,
      error.message
    );
  }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderService.getAllOrdersService(req.query as any);
    successResponse(res, orders, "products fetched orders", StatusCode.OK);
  } catch (error: any) {
    failResponse(
      res,
      error?.message || "Failed to fetch orders",
      StatusCode.Internal_Server_Error
    );
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) {
      return failResponse(
        res,
        Messages.Order_Not_Found,
        StatusCode.Bad_Request
      );
    }
    return successResponse(res, order, Messages.Success);
  } catch (error: any) {
    return errorResponse(
      res,
      Messages.Fail,
      StatusCode.Internal_Server_Error,
      error.message
    );
  }
};

// Update order by ID
// Add this import at the top of your file
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order: any = await OrderService.getOrderById(id);
    if (!order) {
      return failResponse(
        res,
        Messages.Order_Not_Found,
        StatusCode.Bad_Request
      );
    }

    // Build newOrder only with allowed fields
    let newOrder: any = {};
    Object.keys(updateData).forEach((key) => {
      if (orderAllowedUpdates.includes(key)) {
        newOrder[key] = updateData[key];
      }
    });

    if (
      newOrder?.deliveryAddress &&
      typeof newOrder.deliveryAddress !== "object"
    ) {
      return failResponse(
        res,
        "Invalid address format",
        StatusCode.Bad_Request
      );
    }

    // Handle orderStatus-specific logic & validation
    if (newOrder?.orderStatus) {
      if (!allowedOrderStatus.includes(newOrder.orderStatus)) {
        return failResponse(
          res,
          Messages.Invalid_Order_Status,
          StatusCode.Bad_Request
        );
      }

      // Prevent changing from Cancelled -> Delivered or Delivered -> Cancelled
      if (
        newOrder.orderStatus === OrderStatus.Delivered &&
        order.orderStatus === OrderStatus.Cancelled
      ) {
        return failResponse(
          res,
          Messages.Order_Cannot_Delivered,
          StatusCode.Bad_Request
        );
      }

      if (
        newOrder.orderStatus === OrderStatus.Cancelled &&
        order.orderStatus === OrderStatus.Delivered
      ) {
        return failResponse(
          res,
          Messages.Order_Cannot_Cancel,
          StatusCode.Bad_Request
        );
      }

      const currentStatusIndex = validOrderSequence.indexOf(order.orderStatus);
      const newStatusIndex = validOrderSequence.indexOf(newOrder.orderStatus);

      if (
        newOrder.orderStatus !== OrderStatus.Cancelled &&
        (newStatusIndex <= currentStatusIndex ||
          newStatusIndex !== currentStatusIndex + 1)
      ) {
        return failResponse(
          res,
          Messages.Order_Status_Skipped,
          StatusCode.Bad_Request
        );
      }
    }

    // ---------- ASSIGN DELIVERY BOY WHEN STATUS BECOMES READY ----------
    if (
      newOrder?.orderStatus === OrderStatus.ReadyForPickup &&
      order.orderStatus !== OrderStatus.ReadyForPickup
    ) {
      const coords = order.deliveryAddress?.location?.coordinates;
      if (!coords || coords.length !== 2) {
        return failResponse(
          res,
          "Order is missing delivery coordinates",
          StatusCode.Bad_Request
        );
      }

      const nearest = { _id: "69243b5261a6533f0584fc83" };
      if (!nearest) {
        return failResponse(
          res,
          "No delivery boy available nearby",
          StatusCode.Bad_Request
        );
      }

      newOrder.deliveryBoyId = nearest._id;
      await assignDeliveryBoy(Object(nearest._id));
    }

    // ---------- UPDATE ORDER ----------
    const updatedOrder = await OrderService.updateOrderByIdService(
      id,
      newOrder
    );

    if (!updatedOrder) {
      return failResponse(
        res,
        "Failed to update order",
        StatusCode.Internal_Server_Error
      );
    }

    // ✅ BROADCAST SSE EVENT - SIMPLE STATIC DATA
    broadcastStatusUpdate({
      orderId: id,
      oldStatus: order.orderStatus,
      newStatus: updatedOrder.orderStatus,
      deliveryBoyId: updatedOrder.deliveryBoyId,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `✅ SSE broadcast sent for order ${id}: ${updatedOrder.orderStatus}`
    );

    if (
      newOrder?.orderStatus === OrderStatus.Delivered &&
      updatedOrder?.deliveryBoyId
    ) {
      try {
        // Your delivery boy release logic here
      } catch (err) {
        console.error("Error releasing delivery boy:", err);
      }
    }

    return successResponse(
      res,
      updatedOrder,
      Messages.OrderUpdated,
      StatusCode.OK
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "InternalError",
      StatusCode.Bad_Request
    );
  }
};

// Delete order by ID
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await OrderService.deleteOrder(id);
    if (!deleted) {
      return failResponse(
        res,
        Messages.Order_Not_Found,
        StatusCode.Bad_Request
      );
    }
    return successResponse(
      res,
      null,
      Messages.Order_Deleted,
      StatusCode.No_Content
    );
  } catch (error: any) {
    return errorResponse(
      res,
      Messages.Fail,
      StatusCode.Internal_Server_Error,
      error.message
    );
  }
};

export const getOrdersByUserID = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return failResponse(res, "User ID is required", StatusCode.Bad_Request);
    }

    const result = await OrderService.getOrdersByUserIdService(
      userId,
      req.query
    );

    if (!result.orders || result.orders.length === 0) {
      return failResponse(res, "No orders found", StatusCode.Not_Found);
    }

    return successResponse(
      res,
      result, // send full object { orders, meta }
      "Orders fetched successfully",
      StatusCode.OK
    );
  } catch (error: any) {
    console.error("Error fetching orders by user ID:", error);
    return failResponse(
      res,
      "Failed to fetch user orders",
      StatusCode.Internal_Server_Error
    );
  }
};

export const getOrdersByDeliveryBoyID = async (req: Request, res: Response) => {
  try {
    const { deliveryBoyId } = req.params;
    if (!deliveryBoyId) {
      return failResponse(
        res,
        "Delivery Boy ID is required",
        StatusCode.Bad_Request
      );
    }

    const result = await OrderService.getOrdersByDeliveryBoyIdService(
      deliveryBoyId,
      req.query
    );
    if (!result.orders || result.orders.length === 0) {
      return failResponse(res, "No orders found", StatusCode.Not_Found);
    }
    return successResponse(
      res,
      result, // send full object { orders, meta }
      "Orders fetched successfully",
      StatusCode.OK
    );
  } catch (error: any) {
    console.error("Error fetching orders by delivery boy ID:", error);
    return failResponse(
      res,
      "Failed to fetch delivery boy orders",
      StatusCode.Internal_Server_Error
    );
  }
};
