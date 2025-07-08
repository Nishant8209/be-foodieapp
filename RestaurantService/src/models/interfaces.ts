import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export interface Restaurant {
  _id: ObjectId;
  name: string;
  description: string;
  cuisineTypes: string[];
  images: {
    logo: string;
    cover: string;
    gallery: string[];
  };
  licenseNumber?: string;
   restaurantType: 'veg' | 'non-veg' | 'mixed'
  address: {
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
  operatingHours: OperatingHours[];
  contactInfo: {
    name:string;
    phone: string;
    email: string;
    website?: string;
  };
  serviceModes: ('dine-in' | 'takeaway' | 'delivery')[];
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  featuredItems: ObjectId[]; // References to MenuItem
  isActive: boolean;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  isClosed: boolean;
}


