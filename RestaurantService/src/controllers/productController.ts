import { Request, Response } from 'express';
import  * as productService from '../service/productService';
import { Product } from '../models/product';
import { buildFilter, buildProductAggregationPipeline } from '../service/productFilters';
import { errorResponse, failResponse, successResponse } from '../utils/response';
import { Messages } from '../utils/constants';
import { StatusCode } from '../utils/StatusCodes';
import { validationResult } from 'express-validator';


// Create new products (handling multiple products)

export const createProducts =  async (req: Request, res: Response): Promise<void>=> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    failResponse(res, errors.array(), StatusCode.Bad_Request);
    return;
  }
    try {
      const product = await productService.createProducts(req.body);
      successResponse(res, product, Messages.Success, StatusCode.Created);
    } catch (error) {
      errorResponse(res, (error as Error).message);
      return;
    }
  }
  
// Get all products with filters and pagination
  export const getAllProducts =  async (req: Request, res: Response): Promise<void> =>{
    try {
      const { sortBy, page = 1, limit = 10, restaurantId, ...restQuery } = req.query;
      const filterQuery = {
        ...restQuery,
        ...(restaurantId && { restaurantId }), // add it only if it's present
      };
      const pipeline = await buildProductAggregationPipeline(
        filterQuery,
        sortBy as string,
        Number(page),
        Number(limit)
      );
  

      const products = await Product.aggregate(pipeline);
      const totalCount = await Product.countDocuments(await buildFilter(filterQuery));
      const hasMore = (Number(page) - 1) * Number(limit) + products.length < totalCount;
      successResponse(res, {
        products,
        totalCount,
        hasMore,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      });
    } catch (error) {
      errorResponse(res, 'Error fetching products by filters');
    }
  }
  //update product
  export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      failResponse(res, errors.array(), StatusCode.Bad_Request);
      return;
    }
    try {
      const product = await productService.updateProduct(req.params.productId, req.body);
      if (!product) {
        failResponse(res, Messages.Product_Not_Found, StatusCode.Not_Found);
        return;
      }
      successResponse(res, product, Messages.Product_Created);
      return;
    } catch (error) {
      errorResponse(res, (error as Error).message);
      return;
    }
  };


  
 // Delete a product
 export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const product = await productService.deleteProduct(req.params.productId) ;
    if (!product) {
      failResponse(res, Messages.Product_Not_Found, StatusCode.Not_Found) ;
      return;
    }
    successResponse(res, [],Messages.Product_Deleted, StatusCode.No_Content) ;
    return;
  } catch (error) {
    errorResponse(res, (error as Error).message) ;
    return;
  }
};

// Get a product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
   
    const product = await productService.getProductById(req.params.productId) ;
    if (!product) {
      failResponse(res, Messages.No_Products_Found_For_This_Category, StatusCode.Not_Found) ;
      return;
    }
    successResponse(res, { product }) ;
    return;
  } catch (error) {
    errorResponse(res, (error as Error).message) ;
    return;
  }
};