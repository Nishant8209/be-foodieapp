import { Request, Response } from 'express';
import { productService } from '../service/productService';
import { Product } from '../models/product';


export class ProductController {

  async createProduct(req: Request, res: Response): Promise<void> {
    console.log('bdsbfkjdkjn')
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating product', error });
    }
  }
  // Implement the getAllProducts function with filtering, sorting, and pagination
   // Get all products with optional filtering, sorting, and pagination
   async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { sortBy, page = 1, limit = 10, restaurantId, ...filterQuery } = req.query;
  
      // If restaurantId is provided, add it to the filterQuery
      if (restaurantId) {
        filterQuery.restaurantId = restaurantId;
      }
  
      // Fetch products and metadata from the service
      const { products, meta } = await productService.getAllProducts(
        filterQuery as Record<string, any>,  // Filter query parameters
        sortBy as string,  // Sorting (optional)
        Number(page),  // Page number
        Number(limit)   // Limit per page
      );
  
      // Return products and metadata in the response
      res.status(200).json({ success: true, data: products, meta });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products', error });
    }
  }
//update
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const updatedData = req.body;  // The data to update the product with

      console.log('Attempting to update product with ID:', productId);  // Log the product ID

      const updatedProduct = await productService.updateProduct(productId, updatedData);

      if (!updatedProduct) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating product', error });
    }
  }

  
    // Delete a product by its ID
    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
          const { productId } = req.params;
          console.log('Attempting to delete product with ID:', productId);  // Log the product ID
      
          const deletedProduct = await productService.deleteProduct(productId);
      
          if (!deletedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
          }
      
          res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
          res.status(500).json({ success: false, message: 'Error deleting product', error });
        }
      }
      
}

export const productController = new ProductController();
