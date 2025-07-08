import { Request, Response } from 'express';
import * as OrderService from '../services/orderService';
import axios, { all } from 'axios';
import mongoose from 'mongoose';
import { errorResponse, failResponse, successResponse } from '../utils/response';
import { StatusCode } from '../utils/StatusCodes';
import {getAllOrdersService} from '../services/orderService';
import { buildFilter, buildProductAggregationPipeline } from '../utils/orderFilters';
import order from '../models/order';
import { allowedOrderStatus, Messages, orderAllowedUpdates, validOrderSequence } from '../utils/constants';
import { OrderStatus } from '../models/interface';


// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const { userId, restaurantId } = orderData;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return failResponse(res, 'Invalid userId format', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return failResponse(res, 'Invalid restaurantId format', 400);
    }

    const userServiceUrl = process.env.USER_SERVICE_URL;
    const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL;

    // 2. Validate user existence
    try {
      await axios.get(`${userServiceUrl}/${userId}`, {
        headers: {
          Authorization: req.headers.authorization || '',
        },
      });
    } catch {
      return failResponse(res, 'User not found', 404);
    }

    // 3. Validate restaurant existence
    try {
      await axios.get(`${restaurantServiceUrl}/${restaurantId}`, {
        headers: {
          Authorization: req.headers.authorization || '',
        },
      });
    } catch {
      return failResponse(res, 'Restaurant not found', 404);
    }

    // 4. Create order
    const order = await OrderService.createOrder(orderData);
    return successResponse(res, order, Messages.OrderCreated, StatusCode.Created);

  } catch (error: any) {
    console.error('Order creation error:', error.message);
    return errorResponse(res, Messages.Fail, StatusCode.Internal_Server_Error, error.message);
  }
};


// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
   try {
      const { sortBy, page = 1, limit = 10, restaurantId, userId,...restQuery } = req.query;
      const filterQuery = {
        ...restQuery,
        ...(restaurantId && { restaurantId }),
        ...(userId && { userId }),
      };
      const pipeline = await buildProductAggregationPipeline(
        filterQuery,
        sortBy as string,
        Number(page),
        Number(limit)
      );
  

      const products = await order.aggregate(pipeline);
      const totalCount = await order.countDocuments(await buildFilter(filterQuery));
      const hasMore = (Number(page) - 1) * Number(limit) + products.length < totalCount;
      successResponse(res, {
        products,
        totalCount,
        hasMore,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      });
    } catch (error) {
      errorResponse(res, Messages.Order_Not_Found, StatusCode.Internal_Server_Error, (error as any).message);
    }
};


// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) {
      return failResponse(res, Messages.Order_Not_Found, StatusCode.Bad_Request);
    }
    return successResponse(res, order, Messages.Success);
  } catch (error: any) {
    return errorResponse(res, Messages.Fail, StatusCode.Internal_Server_Error, error.message);
  }
};

// Update order by ID
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order: any = await OrderService.getOrderById(id);
    if (!order) {
      return failResponse(res, Messages.Order_Not_Found, StatusCode.Bad_Request);
    }

    //  Add address to allowed updates
    let newOrder: any = {};
    Object.keys(updateData).forEach((key) => {
      if (orderAllowedUpdates.includes(key)) {
        newOrder[key] = updateData[key];
      }
    });

    //  Optional: validate address format
    if (newOrder?.address && typeof newOrder.address !== 'string') {
      return failResponse(res, 'Invalid address format', StatusCode.Bad_Request);
    }

    //  Handle orderStatus-specific logic
    if (newOrder?.orderStatus) {
      if (!allowedOrderStatus.includes(newOrder.orderStatus)) {
        return failResponse(res, Messages.Invalid_Order_Status, StatusCode.Bad_Request);
      }

      if (
        updateData?.orderStatus === OrderStatus.Delivered &&
        order.orderStatus === OrderStatus.Cancelled
      ) {
        return failResponse(res, Messages.Order_Cannot_Delivered, StatusCode.Bad_Request);
      }

      if (
        updateData?.orderStatus === OrderStatus.Cancelled &&
        order.orderStatus === OrderStatus.Delivered
      ) {
        return failResponse(res, Messages.Order_Cannot_Cancel, StatusCode.Bad_Request);
      }

      const currentStatusIndex = validOrderSequence.indexOf(order.orderStatus);
      const newStatusIndex = validOrderSequence.indexOf(newOrder?.orderStatus);

      if (
        newOrder?.orderStatus !== OrderStatus.Cancelled &&
        (newStatusIndex <= currentStatusIndex || newStatusIndex !== currentStatusIndex + 1)
      ) {
        return failResponse(res, Messages.Order_Status_Skipped, StatusCode.Bad_Request);
      }
    }

    // ✅ Update the order
    const updatedOrder = await OrderService.updateOrderByIdService(id, newOrder);

    return successResponse(res, updatedOrder, Messages.OrderUpdated, StatusCode.OK);
  } catch (error: any) {
    return errorResponse(res, error.message, StatusCode.Bad_Request);
  }
};



// Delete order by ID
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await OrderService.deleteOrder(id);
        if (!deleted) {
            return failResponse(res, Messages.Order_Not_Found, StatusCode.Bad_Request);
        }
        return successResponse(res, null, Messages.Order_Deleted, StatusCode.No_Content);
    } catch (error: any) {
        return errorResponse(res, Messages.Fail, StatusCode.Internal_Server_Error, error.message);
    }
};
