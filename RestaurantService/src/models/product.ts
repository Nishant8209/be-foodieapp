import mongoose, { Schema, Document } from "mongoose";
interface Image {
  url: string;
  altText: string;
}
export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  category:
    | "Breakfast"
    | "Chinese"
    | "Indian"
    | "Italian"
    | "Mexican"
    | "Dessert"
    | "Beverage"
    | "Fast Food"
    | "Other";
  restaurantId: mongoose.Types.ObjectId;
  images?: Image[];
  ingredients?: string[];
  rating?: number;
  availability: boolean;
  foodType?: "Veg" | "Non-Veg";
  servingSize?: string;
  isDiscounted?: boolean;
  discount?: number;
  specialInstructions?: string;
  spiceLevel?: "Mild" | "Medium" | "Spicy";
  tags?: string[];
  cookingTime?: number;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "Breakfast",
        "Chinese",
        "Indian",
        "Italian",
        "Mexican",
        "Dessert",
        "Beverage",
        "Fast Food",
        "Other",  
      ],
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String, required: true },
      },
    ],
    ingredients: [{ type: String }],
    rating: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    foodType: { type: String, enum: ["Veg", "Non-Veg"] },
    servingSize: { type: String },
    isDiscounted: { type: Boolean, default: false },
    discount: { type: Number },
    specialInstructions: { type: String },
    spiceLevel: { type: String, enum: ["Mild", "Medium", "Spicy"] },
    tags: [{ type: String, default: [] }],
    cookingTime: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
