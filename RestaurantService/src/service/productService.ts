import mongoose from "mongoose";
import { IProduct, Product } from "../models/product";


class ProductService {
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    return await product.save();
  }
// Method to get all products with filtering, pagination, and sorting
async getAllProducts(
    filterQuery: Record<string, any>,
    sortBy: string,
    page: number,
    limit: number
  ): Promise<{ products: IProduct[]; meta: any }> {
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {};
  
    // Handle sorting if the sortBy parameter is provided
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sortOptions[field] = order === 'asc' ? 1 : -1;
    }
  
    // Add restaurantId filter if provided
    if (filterQuery.restaurantId) {
      filterQuery.restaurantId = new mongoose.Types.ObjectId(filterQuery.restaurantId);
    }
  
    // Build the filter query dynamically based on the query parameters
    const filters: Record<string, any> = {};
    for (const [key, value] of Object.entries(filterQuery)) {
      if (value) {
        filters[key] = value;
      }
    }
  
    // Get the total number of products that match the filters
    const totalRecords = await Product.countDocuments(filters);
  
    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);
  
    // Fetch the products with the aggregation pipeline
    const products = await Product.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);
  
    // Determine if there are more products
    const hasMore = page < totalPages;
  
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
  }
  
  async updateProduct(productId:string, data:Partial<IProduct>):Promise<IProduct |  null>{
    const updateProduct = await Product.findByIdAndUpdate(productId, data,{new:true});
    return updateProduct;
  }
 
  async deleteProduct(productId: string): Promise<IProduct | null> {
    const deletedProduct = await Product.findByIdAndDelete(productId);  // Delete the product by its ID
    return deletedProduct;
  }
  
}

export const productService = new ProductService();
