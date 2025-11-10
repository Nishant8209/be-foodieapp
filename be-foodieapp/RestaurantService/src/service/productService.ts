
import { IProduct, Product } from "../models/product";
import { RestaurantModel } from "../models/restaurant";
import { buildPaginationQuery } from "../utils/appFunctions";
import { Messages } from "../utils/constants";

import mongoose from 'mongoose';

export const createProductService = async (productData: any): Promise<IProduct> => {
  try {
    const { restaurantId } = productData;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new Error(Messages.Invalid_Id_Restaurant);
    }

    const restaurantExists = await RestaurantModel.exists({ _id: restaurantId });
    if (!restaurantExists) {
      throw new Error(Messages.Invalid_Id_Restaurant);
    }

    // Ensure images, tags, ingredients are arrays
    const parsedData = {
      ...productData,
      images: Array.isArray(productData.images) ? productData.images : [],
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      ingredients: Array.isArray(productData.ingredients) ? productData.ingredients : [],
    };

    const product = new Product(parsedData);
    await product.save();
    return product;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};


// Get all products with optional filters and sorting
export const getAllProductsService = async (query: {
  name?: string;
  restaurantId?: string;
  category?: string;
  foodType?: string;

  restaurantType?: string;
}) => {
  try {
    const { skip, limit, page } = buildPaginationQuery(query);
    const {
      name,
      restaurantId,
      category,
      foodType,
      restaurantType,
    } = query;

    // Build dynamic search filter based on parameters, excluding empty
    const searchFilter: any = {
      $and: [

        name ? { name: { $regex: name, $options: 'i' } } : null,
        restaurantType ? { restaurantType } : null,
        restaurantId ? { restaurantId: restaurantId } : null,
        category ? { category } : null,
        foodType ? { foodType } : null,
      ].filter(Boolean),
    };
    console.log('restaurantId',restaurantId);
    const totalRecords = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalRecords / limit);
    const hasMore = page < totalPages;

    const selectedFields =
      'name description  images price category restaurantId images ingredients rating availability foodType servingSize isDiscounted discount specialInstructions spiceLevel tags cookingTime';

    const products = await Product.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(selectedFields)
      .exec();

    return {
      products,
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


// Update a product
export const updateProduct = async (id: string, data: any): Promise<IProduct | null> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return updatedProduct;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};


// Delete a product
export const deleteProduct = async (id: any): Promise<IProduct | null> => {
  try {

    const deletedProduct = await Product.findByIdAndDelete(id);
    return deletedProduct;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};


// Get a product by ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {

    const product = await Product.findById(id).exec();
    return product;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

