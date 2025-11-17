import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  images?: { url: string; altText: string }[];
  foodType?: "Veg" | "Non-Veg";
}

const ProductSchema: Schema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [
    { url: { type: String, required: true }, altText: { type: String, required: true } },
  ],
  foodType: { type: String, enum: ["Veg", "Non-Veg"],required: true },
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
