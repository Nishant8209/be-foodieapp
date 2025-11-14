// src/service/restaurantService.ts
import { Types } from 'mongoose';
import { Restaurant } from '../models/interfaces';
import { RestaurantModel } from '../models/restaurant';
import { buildPaginationQuery } from '../utils/appFunctions';
import { validateRestaurantInput } from './restaurantFilter';
import { verifyOwnerId } from '../utils/verifyOwnerId';
import MenuItem from "../models/menu";
import { Product } from '../models/product';



export const createRestaurantService = async (
  data: Partial<Restaurant>
): Promise<Restaurant> => {
  try {
    console.log('data in service', data);
    const parsedData: Partial<Restaurant> = { ...data };

    const tryParseJson = (value: any) => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as is if invalid JSON
      }
    };

    // Parse only if string, otherwise keep as is (array or object)
    parsedData.operatingHours = tryParseJson(data.operatingHours);
    parsedData.featuredItems = tryParseJson(data.featuredItems);
    parsedData.address = tryParseJson(data.address);
    parsedData.contactInfo = tryParseJson(data.contactInfo);

    // Handle cuisineTypes which may be array or single string
    if (Array.isArray(data.cuisineTypes)) {
      parsedData.cuisineTypes = data.cuisineTypes;
    } else if (typeof data.cuisineTypes === "string") {
      // Try parse JSON string or wrap in array
      try {
        parsedData.cuisineTypes = JSON.parse(data.cuisineTypes);
      } catch {
        parsedData.cuisineTypes = [data.cuisineTypes];
      }
    }
    // Validate the parsed data
    validateRestaurantInput(parsedData);

    if (!parsedData.ownerId) throw new Error("ownerId is required");

    const ownerIsValid = await verifyOwnerId(parsedData.ownerId.toString());
    if (!ownerIsValid) throw new Error("Invalid ownerId: user does not exist.");

    const now = new Date();
    const newRestaurant = await RestaurantModel.create({
      ...parsedData,
      createdAt: now,
      updatedAt: now,
    });

    return newRestaurant;
  } catch (error) {
    throw error;
  }
};



export const getAllRestaurantsService = async (query: any) => {
  try {
    const { skip, limit, page } = buildPaginationQuery(query);
    const { name, city, cuisineType, isActive, restaurantType, productName } = query;

    let restaurantIdsFromProducts: Types.ObjectId[] = [];

    // ----------------------------
    // filter based on product name
    // ----------------------------
    if (productName) {
      const idsAgg = await Product.aggregate([
        {
          $match: { name: { $regex: productName, $options: "i" } }
        },
        {
          $group: { _id: "$restaurantId" }
        }
      ]);

      restaurantIdsFromProducts = idsAgg
        .map((d: any) => d._id)
        .filter((x: any) => x != null);
    }

    // ------------------------
    // main restaurant filter
    // ------------------------
    const searchFilter: any = {
      $and: [
        isActive !== undefined ? { isActive: isActive === "true" } : {},
        cuisineType ? { cuisineTypes: cuisineType } : {},
        city ? { "address.city": { $regex: city, $options: "i" } } : {},
        restaurantType ? { restaurantType } : {}
      ].filter(Boolean)
    };

    // Add OR condition for restaurant name or product match
    const orConditions: any[] = [];

    if (name) {
      orConditions.push({ name: { $regex: name, $options: "i" } });
    }

    if (productName && restaurantIdsFromProducts.length > 0) {
      orConditions.push({ _id: { $in: restaurantIdsFromProducts } });
    }

    if (orConditions.length > 0) {
      searchFilter.$and.push({ $or: orConditions });
    }

    const totalRecords = await RestaurantModel.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalRecords / limit);
    const hasMore = page < totalPages;

    const selectedFields =
      "name description cuisineTypes address images operatingHours contactInfo averageRating totalRatings licenseNumber restaurantType isVerified serviceModes ownerId acceptingOrders";

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
        hasMore
      }
    };
  } catch (err: any) {
    console.error("Error fetching restaurants:", err);
    throw new Error(err?.message || "Failed to fetch restaurants");
  }
};




export const getRestaurantByIdService = async (id: string): Promise<Restaurant | null> => {
  try {
    // Only fetch selected fields
    const selectedFields = `name description cuisineTypes address images  operatingHours contactInfo averageRating totalRatings acceptingOrders`;

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
  updateData: Partial<Restaurant>,
) => {
  try {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new Error("Invalid restaurant ID");
    }

    const parsedData: Partial<Restaurant> = { ...updateData };

    const tryParseJson = (value: any) => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as is if invalid JSON
      }
    };

    parsedData.operatingHours = tryParseJson(updateData.operatingHours);
    parsedData.featuredItems = tryParseJson(updateData.featuredItems);
    parsedData.address = tryParseJson(updateData.address);
    parsedData.contactInfo = tryParseJson(updateData.contactInfo);


    // Handle cuisineTypes which may be array or single string
    if (Array.isArray(updateData.cuisineTypes)) {
      parsedData.cuisineTypes = updateData.cuisineTypes;
    } else if (typeof updateData.cuisineTypes === "string") {
      // Try parse JSON string or wrap in array
      try {
        parsedData.cuisineTypes = JSON.parse(updateData.cuisineTypes);
      } catch {
        parsedData.cuisineTypes = [updateData.cuisineTypes];
      }
    }

    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      restaurantId,
      { ...parsedData, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updatedRestaurant) {
      throw new Error("Restaurant not found");
    }

    return updatedRestaurant;
  } catch (err) {
    console.error("Error updating restaurant:", err);
    throw err; // rethrow to keep stack trace
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