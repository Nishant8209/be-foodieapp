import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
}

export interface IMenu extends Document {
    restaurantId: mongoose.Types.ObjectId;
    items: IMenuItem[];
    updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema<IMenuItem>({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true }
});

const MenuSchema: Schema = new Schema<IMenu>({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: { type: [MenuItemSchema], required: true },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMenu>('Menu', MenuSchema);