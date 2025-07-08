import mongoose, { ObjectId } from "mongoose";

export interface IOrderItem {
  foodId: string;
  quantity: number;
  price: number;
}
export enum OrderStatus {
  Pending = "Pending",           
  Confirmed = "Confirmed",        
  Preparing = "Preparing",         
  ReadyForPickup = "ReadyForPickup",
  OutForDelivery = "OutForDelivery",
  Delivered = "Delivered",          
  Cancelled = "Cancelled",         
  Failed = "Failed",              
  Returned = "Returned"           
}
export const PaymentStatus = {
    Pending: 'Pending',
    Paid: 'Paid',
    Failed: 'Failed'
}
export enum Status {
  Active = 'active',
  InActive = 'inactive',
  Deleted = 'deleted'
}
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: {
    foodId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  orderStatus: OrderStatus;
  discount: {
    couponCode: string;
    amount: number;
  };
  deliveryAddress:  {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  paymentInfo: {
    method: string, // e.g., 'Credit Card', 'PayPal', 'COD'
    status: string, // 'Pending', 'Paid', 'Failed'
    transactionId: string, // Optional, for tracking payment
  },
  totalAmount: number;
  taxAmount: number;
  shippingCost: number;
  status: Status;
  isActive: boolean;
  createdAt: Date;
  createdBy: ObjectId;
  updatedAt: Date;
  updatedBy: ObjectId;
  version: number;
}