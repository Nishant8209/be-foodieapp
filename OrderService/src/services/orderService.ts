import mongoose from "mongoose";
import { IOrder } from "../models/interface";
import OrderModel from "../models/order";
import { Messages } from "../utils/constants";

export const createOrder = async (orderData: IOrder): Promise<IOrder> => {
  try {
    const { items, totalAmount, taxAmount = 0, shippingCost = 0, discount } = orderData;

    let calculatedTotal = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.foodId.toString())) {
        throw new Error('Invalid foodId in items');
      }

      if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        throw new Error('Invalid price or quantity');
      }

      calculatedTotal += item.price * item.quantity;
    }

    // Apply tax and shipping
    calculatedTotal += taxAmount;
    calculatedTotal += shippingCost;

    // Subtract discount if provided
    if (discount && typeof discount.amount === 'number') {
      calculatedTotal -= discount.amount;
    }

    // Round to handle floating point precision errors
    const roundedTotal = Math.round(calculatedTotal * 100) / 100;
    const expectedTotal = Math.round(totalAmount * 100) / 100;
  
    if (roundedTotal !== expectedTotal) {
      throw new Error(Messages.Order_Total_Mismatch );
    }

    const newOrder = await OrderModel.create(orderData);
    return newOrder;

  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};

export const getAllOrdersService = async (filter: any = {}, sortOptions: any = {})=> {
    try {
    const products = await OrderModel.find(filter).sort(sortOptions);
    return products;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
    try {
        return await OrderModel.findById(id).exec();
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
};

export const updateOrderByIdService = async (orderId: string, order: IOrder) => {
    try {
        return await OrderModel.findByIdAndUpdate(
            orderId,
            order,
            { new: true, runValidators: true } // Return the updated document and run schema validation
        );
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export const deleteOrder = async (id: string): Promise<boolean> => {
    try {
        const result = await OrderModel.findByIdAndDelete(id);
        return result !== null;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};

