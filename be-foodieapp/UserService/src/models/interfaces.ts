import mongoose, { Document, ObjectId } from "mongoose";

// ----------------------------------------
// Basic Fields Interface
// ----------------------------------------
export interface IBasicFields extends Document {
  isActive: boolean;
  createdAt: Date;
  createdBy: ObjectId;
  updatedAt: Date;
  updatedBy: ObjectId;
  status: string;
  version: number;
}

// ----------------------------------------
// Query Fields Interface
// ----------------------------------------
export interface BasicQueryFields {
  search?: string;
  page?: number;
  limit?: number;
  userType?: string;
  status?: string;
}

// ----------------------------------------
// Address Interface
// ----------------------------------------
export interface IUserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// ----------------------------------------
// User Interface
// ----------------------------------------
export interface IUser extends IBasicFields {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userType: UserType;
  profilePic: string;
  isVerified: boolean;
  verificationToken: string | null;
  tokenCreatedAt: Date;
  hashedToken: string | null;
  favoriteProducts: string[];
  keycloakId: string;
  addresses: IUserAddress[];
}

// ----------------------------------------
// User Type Enum
// ----------------------------------------
export enum UserType {
  CUSTOMER = "customer",
  VENDOR = "vendor",
  DELIVERY = "delivery",
  ADMIN = "admin",
}

// ----------------------------------------
// Status Enum
// ----------------------------------------
export enum Status {
  Active = "active",
  InActive = "inactive",
  Deleted = "deleted",
}
