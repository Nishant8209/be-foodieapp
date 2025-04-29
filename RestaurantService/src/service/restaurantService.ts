// src/service/restaurantService.ts
import { Restaurant } from '../models/interfaces';
import { RestaurantModel } from '../models/restaurant';
import { buildPaginationQuery } from '../utils/appFunctions';

/**
 * Basic manual validation function
 */
const validateRestaurantInput = (data: Partial<Restaurant>): void => {
    if (!data.name) throw new Error('Restaurant name is required.');
    if (!data.description) throw new Error('Restaurant description is required.');
    if (!data.cuisineTypes || !Array.isArray(data.cuisineTypes) || data.cuisineTypes.length === 0) {
        throw new Error('At least one cuisine type is required.');
    }

    const address = data.address;
    if (!address || !address.addressLine1 || !address.city || !address.state || !address.postalCode || !address.country || !address.coordinates) {
        throw new Error('Complete address with coordinates is required.');
    }

    if (typeof address.coordinates.latitude !== 'number' || typeof address.coordinates.longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers.');
    }

    const contact = data.contactInfo;
    if (!contact || !contact.phone || !contact.email) {
        throw new Error('Phone and email are required in contact info.');
    }

    if (!data.priceRange || data.priceRange < 1 || data.priceRange > 4) {
        throw new Error('Price range must be between 1 and 4.');
    }

    if (!Array.isArray(data.operatingHours)) {
        throw new Error('Operating hours must be an array.');
    }

    data.operatingHours.forEach((hour, index) => {
        if (typeof hour.dayOfWeek !== 'number' || hour.dayOfWeek < 0 || hour.dayOfWeek > 6) {
            throw new Error(`Invalid dayOfWeek at index ${index}.`);
        }

        if (!hour.isClosed && (!hour.open || !hour.close)) {
            throw new Error(`Open and close times required for day index ${index} unless marked closed.`);
        }
    });
};


export const createRestaurantService = async (
    data: Partial<Restaurant>
): Promise<Restaurant> => {
    try {
        validateRestaurantInput(data);
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
  }) => {
    try {
      const { skip, limit, page } = buildPaginationQuery(query);
      const { name, city, cuisineType, isActive } = query;
  
      const searchFilter: any = {
        $and: [
          isActive !== undefined ? { isActive: isActive === 'true' } : {},
          cuisineType ? { cuisineTypes: cuisineType } : {},
          city ? { 'address.city': { $regex: city, $options: 'i' } } : {},
          name ? { name: { $regex: name, $options: 'i' } } : {},
        ].filter(Boolean),
      };
  
      const totalRecords = await RestaurantModel.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalRecords / limit);
      const hasMore = page < totalPages;
  
      const selectedFields = `name description cuisineTypes address images  operatingHours contactInfo averageRating totalRatings`;
   
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