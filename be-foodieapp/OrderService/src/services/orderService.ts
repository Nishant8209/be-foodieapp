import mongoose from "mongoose";
import "../models/Product";

import { IOrder } from "../models/interface";
import OrderModel from "../models/order";
import { Messages } from "../utils/constants";
import order from "../models/order";
import { buildPaginationQuery } from "../utils/appFunctions";

export const createOrder = async (orderData: IOrder): Promise<IOrder> => {
  try {
    const {
      items,
      totalAmount,
      taxAmount = 0,
      shippingCost = 0,
      discount,
    } = orderData;

    let calculatedTotal = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.foodId.toString())) {
        throw new Error("Invalid foodId in items");
      }

      if (typeof item.price !== "number" || typeof item.quantity !== "number") {
        throw new Error("Invalid price or quantity");
      }

      calculatedTotal += item.price * item.quantity;
    }

    // Apply tax and shipping
    calculatedTotal += taxAmount;
    calculatedTotal += shippingCost;

    // Subtract discount if provided
    if (discount && typeof discount.amount === "number") {
      calculatedTotal -= discount.amount;
    }

    // Round to handle floating point precision errors
    const roundedTotal = Math.round(calculatedTotal * 100) / 100;
    const expectedTotal = Math.round(totalAmount * 100) / 100;

    if (roundedTotal !== expectedTotal) {
      throw new Error(Messages.Order_Total_Mismatch);
    }

    const newOrder = await OrderModel.create(orderData);
    return newOrder;
  } catch (error) {
    console.error("Order creation error:", error);
    throw error;
  }
};

export const getAllOrdersService = async (query: {
  userId?: string;
  restaurantId?: string;
  orderStatus?: string;
  orderId?: string;
  restaurantType?: string;
}) => {
  try {
    const { skip, limit, page } = buildPaginationQuery(query);
    const { userId, restaurantId, orderStatus, orderId, restaurantType } =
      query;

    // Build dynamic search filter based on parameters, excluding empty values
    const searchFilter: any = {
      $and: [
        userId ? { userId } : null,
        restaurantId ? { restaurantId } : null,
        orderStatus ? { orderStatus } : null,
        orderId ? { _id: orderId } : null,
        restaurantType ? { restaurantType } : null,
      ].filter(Boolean),
    };

    const totalRecords = await order.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalRecords / limit);
    const hasMore = page < totalPages;

    // Select only fields relevant to orders
    const selectedFields =
      "userId restaurantId orderStatus orderItems totalAmount  items discount deliveryAddress paymentInfo totalAmount taxAmount shippingCost isActive createdAt updatedAt version";

    const orders = await order
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "items.foodId",
        model: "Product", // must match Product model name
        select: "name price  images foodType category", // only needed product fields
      })
      .select(selectedFields)
      .exec();

    return {
      orders,
      meta: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      },
    };
  } catch (err) {
    console.error("Error fetching orders:", err);
    throw new Error("Failed to fetch orders");
  }
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  try {
    return await OrderModel.findById(id)
      .populate({
        path: "items.foodId",
        model: "Product", // matches the registered model name
        select: "name price  images foodType category", // only needed fields
      })
      .exec();
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};

export const updateOrderByIdService = async (
  orderId: string,
  order: IOrder
) => {
  try {
    return await OrderModel.findByIdAndUpdate(
      orderId,
      order,
      { new: true, runValidators: true } // Return the updated document and run schema validation
    );
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const result = await OrderModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export const getOrdersByUserIdService = async (
  userId: string,
  query: any = {}
): Promise<any> => {
  const { skip, limit, page } = buildPaginationQuery(query);
  const orderStatus = query.orderStatus;
  // Base filter
  const filter: any = { userId };

  // Apply orderStatus filter if provided
  if (orderStatus && orderStatus !== "ALL") {
    filter.orderStatus = orderStatus;
  }

  const totalRecords = await OrderModel.countDocuments(filter);

  const orders = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "items.foodId",
      model: "Product",
      select: "name price images foodType category",
    });

  const totalPages = Math.ceil(totalRecords / limit);
  const hasMore = page < totalPages;

  return {
    orders,
    meta: {
      totalRecords,
      totalPages,
      currentPage: page,
      limit,
      hasMore,
    },
  };
};

export const getOrdersByDeliveryBoyIdService = async (
  deliveryBoyId: string,
  query: any = {} 
):Promise <any>=>{
 
  const filter: any = { deliveryBoyId };
  const totalRecords = await OrderModel.countDocuments(filter);
  const orders = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
   
    .populate({
      path: "items.foodId",
      model: "Product",
      select: "name price images foodType category",
    });   
  return {
    orders

  };
}