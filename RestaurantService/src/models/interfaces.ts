import { ObjectId } from 'mongodb';

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
    phone: string;
    email: string;
    website?: string;
  };
  averageRating: number;
  totalRatings: number;
  priceRange: 1 | 2 | 3 | 4; // $ to $$$$
  featuredItems: ObjectId[]; // References to MenuItem
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
 
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  isClosed: boolean;
}
