import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  category: string;
  restaurantId: mongoose.Types.ObjectId;
  image?: string;
  ingredients?: string[];
  rating?: number;
  availability: boolean;
  isVeg: boolean;
  deliveryTime?: number;
  servingSize?: string;
  orderCount?: number;
  isDiscounted?: boolean;
  discount?: number;
  specialInstructions?: string;
  spiceLevel?: string;
  tags?: string[];
  cookingTime?: number;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  restaurantId: { type: mongoose.Types.ObjectId, required: true, ref: 'Restaurant' },
  image: { type: String },
  ingredients: [{ type: String }],
  rating: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  isVeg: { type: Boolean, required: true },
  deliveryTime: { type: Number },
  servingSize: { type: String },
  orderCount: { type: Number, default: 0 },
  isDiscounted: { type: Boolean, default: false },
  discount: { type: Number },
  specialInstructions: { type: String },
  spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Spicy'] },
  tags: [{ type: String }],
  cookingTime: { type: Number },
}, {
  timestamps: true,
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
