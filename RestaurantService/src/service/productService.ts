
import {  IProduct, Product } from "../models/product";
import { RestaurantModel } from "../models/restaurant";
import { Messages } from "../utils/constants";

import mongoose from 'mongoose';
export const createProducts = async (productData: any[]): Promise<IProduct[]> => {
  try {
    const products = await Promise.all(
      productData.map(async (data) => {
        const { restaurantId } = data;

     
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
          throw new Error(Messages.Invalid_Id_Restaurant);
        }

        const restaurantExists = await RestaurantModel.exists({ _id: restaurantId });

        if (!restaurantExists) {
          throw new Error(Messages.Invalid_Id_Restaurant);
        }

        const product = new Product(data);
        await product.save();
        return product;
      })
    );

    return products;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

// Get all products with optional filters and sorting
export const getAllProducts = async (filter: any = {}, sortOptions: any = {}): Promise<IProduct[]> => {
  try {
    const products = await Product.find(filter).sort(sortOptions);
    return products;
  } catch (error) {
    throw new Error((error as Error).message);
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
    console.log("deleteProduct", id);
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

