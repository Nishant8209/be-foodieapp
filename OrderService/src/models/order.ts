import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, OrderStatus, PaymentStatus, Status } from './interface';

// Order item schema
const OrderItemSchema = new Schema({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // price snapshot
});


const OrderSchema = new Schema<IOrder> (
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'Order must contain at least one item'],
    },

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },

    discount: {
      couponCode: {
        type: String,
        default: 'SAVE0',
      },
      amount: {
        type: Number,
        default: 0,
      },
    },

    deliveryAddress: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },

    paymentInfo: {
        method: { type: String, required: true }, // e.g., 'Credit Card', 'PayPal', 'COD'
        status: { type: String, default: PaymentStatus.Pending }, // 'Pending', 'Paid', 'Failed'
        transactionId: { type: String }, // Optional, for tracking payment
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    shippingCost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Active,
    },

    version: {
      type: Number,
      default: 1,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
