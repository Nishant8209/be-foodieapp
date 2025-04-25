// File: /src/models/menuItem.model.ts
import mongoose, { Schema } from 'mongoose';
import { MenuItem, CustomizationOption } from './interfaces';

const customizationOptionSchema = new Schema<CustomizationOption>({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  multiSelect: { type: Boolean, default: false },
  options: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }]
});

const menuItemSchema = new Schema<MenuItem>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  attributes: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    containsNuts: { type: Boolean, default: false },
    spicyLevel: { type: Number, default: 0, min: 0, max: 3 }
  },
  customizationOptions: [customizationOptionSchema],
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const MenuItemModel = mongoose.model<MenuItem>('MenuItem', menuItemSchema);