// src/service/restaurantService.ts
import { Types } from 'mongoose';
import { Restaurant } from '../models/interfaces';
import { RestaurantModel } from '../models/restaurant';
import { buildPaginationQuery } from '../utils/appFunctions';
import { validateRestaurantInput } from './restaurantFilter';
import { verifyOwnerId } from '../utils/verifyOwnerId';





export const createRestaurantService = async (
  data: Partial<Restaurant>
): Promise<Restaurant> => {
  try {
    validateRestaurantInput(data);
    if (!data.ownerId) {
      throw new Error('ownerId is required');
    }
    const ownerIsValid = await verifyOwnerId(data.ownerId.toString());

    if (!ownerIsValid) {
      throw new Error("Invalid ownerId: user does not exist.");
    }
    const now = new Date();
    const newRestaurant = await RestaurantModel.create({ ...data, createdAt: now, updatedAt: now });
    return newRestaurant;
  } catch (error) {
    throw error;
  }
};
export const getAllRestaurantsService = async (query: {
  name?: string;
  city?: string;
  cuisineType?: string;
  isActive?: string;
  page: number;
  limit: number;
  restaurantType?: 'veg' | 'non-veg' | 'mixed';
}) => {
  try {
    const { skip, limit, page } = buildPaginationQuery(query);
    const { name, city, cuisineType, isActive ,restaurantType } = query;

    const searchFilter: any = {
      $and: [
        isActive !== undefined ? { isActive: isActive === 'true' } : {},
        cuisineType ? { cuisineTypes: cuisineType } : {},
        city ? { 'address.city': { $regex: city, $options: 'i' } } : {},
        name ? { name: { $regex: name, $options: 'i' } } : {},
        restaurantType ? { restaurantType } : {},
      ].filter(Boolean),
    };

    const totalRecords = await RestaurantModel.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalRecords / limit);
    const hasMore = page < totalPages;

    const selectedFields = `name description cuisineTypes address images  operatingHours contactInfo averageRating totalRatings licenseNumber restaurantType isVerified serviceModes ownerId`;

    const restaurants = await RestaurantModel.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(selectedFields)
      .exec();

    return {
      restaurants,
      meta: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      },
    };
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    throw new Error('Failed to fetch restaurants');
  }
};


export const getRestaurantByIdService = async (id: string): Promise<Restaurant | null> => {
  try {
    // Only fetch selected fields
    const selectedFields = `name description cuisineTypes address images  operatingHours contactInfo averageRating totalRatings`;

    const restaurant = await RestaurantModel.findById(id).select(selectedFields);

    return restaurant;
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    return null;
  }
};


// Function to update a restaurant
export const updateRestaurantService = async (
  restaurantId: string,
  updateData: Partial<Restaurant>
) => {
  try {

    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new Error('Invalid restaurant ID');
    }

    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantId,
      { ...updateData, updatedAt: new Date() },
      { new: true } // return the updated document
    ).exec();

    if (!updatedRestaurant) {
      throw new Error('Restaurant not found');
    }

    return updatedRestaurant;
  } catch (err) {
    console.error('Error updating restaurant:', err);
    throw new Error('Failed to update restaurant');
  }
};


// Function to delete a restaurant
export const deleteRestaurantService = async (
  restaurantId: string
): Promise<Restaurant | null> => {
  try {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new Error('Invalid restaurant ID');
    }

    const deletedRestaurant = await RestaurantModel.findByIdAndDelete(restaurantId).exec();

    if (!deletedRestaurant) {
      throw new Error('Restaurant not found');
    }

    return deletedRestaurant;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw new Error('Failed to delete restaurant');
  }
};