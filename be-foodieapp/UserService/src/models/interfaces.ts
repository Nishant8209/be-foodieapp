import mongoose, { ObjectId, Document } from "mongoose";


export interface IBasicFields extends Document {
  isActive: boolean;
  createdAt: Date;
  createdBy: ObjectId;
  updatedAt: Date;
  updatedBy: ObjectId,
  status: string,
  version: number
}

export interface BasicQueryFields {
  search?: string,
  page?: number,
  limit?: number,
  userType?: string,
  status?: string
}
// User interface
export interface IUser extends IBasicFields {
  email: string;
  firstName: string;
  lastName: string
  password: string;
  userType: UserType,
  profilePic: string,
  isVerified: Boolean,
  verificationToken: string | null, // Invalidate the token
  tokenCreatedAt: Date,
  hashedToken: string | null,
  favoriteProducts: string[],
  
  addresses: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: number,
    location: {   // Rename from 'coordinates' to 'location' (recommended)
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      required: true
    }
  }
  }[]
}

export enum UserType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

// enums 
export enum Status {
  Active = 'active',
  InActive = 'inactive',
  Deleted = 'deleted'
}

