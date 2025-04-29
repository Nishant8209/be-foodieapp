import  { ObjectId, Document } from "mongoose";


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
    phone: number
  }[]
}

export enum UserType {
  Admin = "admin",
  User = "user",
  Operator = "Operator"
}

// enums 
export enum Status {
  Active = 'active',
  InActive = 'inactive',
  Deleted = 'deleted'
}




export interface ImageInfo {
  url: string;
  altText?: string;
  order?: number;
}



