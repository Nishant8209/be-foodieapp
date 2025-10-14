import { Request, Response } from 'express';
import * as productService from '../service/productService';
import { Product } from '../models/product';
import { buildFilter, buildProductAggregationPipeline } from '../service/productFilters';
import { errorResponse, failResponse, successResponse } from '../utils/response';
import { Messages } from '../utils/constants';
import { StatusCode } from '../utils/StatusCodes';
import { validationResult } from 'express-validator';
import { uploadToCloudinary } from '../utils/UploadImage';


// Create new products (handling multiple products)
export const createProducts = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    // Parse altText from request body if sent as JSON string
    let altTexts: string[] = [];
    if (req.body.altTexts) {
      try {
        altTexts = JSON.parse(req.body.altTexts);
      } catch {
        console.warn("Failed to parse altTexts, using default values");
      }
    }

    // Helper function to safely parse JSON
    const tryParseJson = (value: any) => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return value; // return as-is if not valid JSON
      }
    };

    // Parse tags and ingredients safely
    const tags = tryParseJson(req.body.tags);
    const ingredients = tryParseJson(req.body.ingredients);

    // Upload images to Cloudinary
    let uploadedImages: { url: string; altText: string }[] = [];
    if (files?.length) {
      uploadedImages = await Promise.all(
        files.map((file, index) =>
          uploadToCloudinary(file.buffer, "products", file.originalname).then((url) => ({
            url,
            altText: altTexts[index] || file.originalname.replace(/\.[^/.]+$/, ""),
          }))
        )
      );
    }

    const productData = {
      ...req.body,
      tags,
      ingredients,
      images: uploadedImages,
    };

    const product = await productService.createProductService(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};



// Get all products with filters and pagination
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
   try {
          const products = await productService.getAllProductsService(req.query as any);
          successResponse(
              res,
              products,
              "products fetched successfully",
              StatusCode.OK
          );
      } catch (error: any) {
          failResponse(
              res,
              error?.message || "Failed to fetch products",
              StatusCode.Internal_Server_Error
          );
      }
    
}
//update product

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const files = req.files as Express.Multer.File[];
    const existingProduct = await productService.getProductById(productId);

    if (!existingProduct) {
      failResponse(res, Messages.Product_Not_Found, StatusCode.Not_Found);
      return;
    }

    const parsedBody = JSON.parse(req.body.productData || "{}");
    const removedImages: string[] = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

    // ✅ Upload new images
    let uploadedImages: { url: string; altText: string }[] = [];
    if (files?.length) {
      uploadedImages = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file.buffer, "products", file.originalname).then((url) => ({
            url,
            altText: file.originalname.replace(/\.[^/.]+$/, ""),
          }))
        )
      );
    }

    // ✅ Remove deleted images from existing list
    const filteredOldImages = (existingProduct.images || []).filter(
      (img) => !removedImages.includes(img.url)
    );

    // ✅ Merge remaining + new
    parsedBody.images = [...filteredOldImages, ...uploadedImages];

    // ✅ Update product
    const updatedProduct = await productService.updateProduct(productId, parsedBody);

    successResponse(res, updatedProduct, Messages.Product_Updated);
  } catch (error) {
    console.error("Error updating product:", error);
    errorResponse(res, (error as Error).message);
  }
};



// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {

    const product = await productService.deleteProduct(req.params.productId);
    if (!product) {
      failResponse(res, Messages.Product_Not_Found, StatusCode.Not_Found);
      return;
    }
    successResponse(res, [], Messages.Product_Deleted, StatusCode.OK);
    return;
  } catch (error) {
    errorResponse(res, (error as Error).message);
    return;
  }
};

// Get a product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('productId', req.params.productId)
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
      failResponse(res, Messages.No_Products_Found_For_This_Category, StatusCode.Not_Found);
      return;
    }
    successResponse(res, { product });
    return;
  } catch (error) {
    errorResponse(res, (error as Error).message);
    return;
  }
};