// src/controllers/restaurantController.ts
import { Request, Response } from "express";
import {
    createRestaurantService,
    deleteRestaurantService,
    getAllRestaurantsService,
    getRestaurantByIdService,
    updateRestaurantService,
} from "../service/restaurantService";
import { successResponse, failResponse } from "../utils/response";
import { StatusCode } from "../utils/StatusCodes";
import { uploadToCloudinary } from "../utils/UploadImage";
import { RestaurantModel } from "../models/restaurant";
import { Product } from "../models/product";

// Create a new restaurant
export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const files = req.files as { [key: string]: Express.Multer.File[] };
        const images: any = {};

        // Upload logo
        if (files?.logo?.[0]) {
            images.logo = await uploadToCloudinary(
                files.logo[0].buffer,
                "restaurants/logo",
                files.logo[0].originalname
            );
        }

        // Upload cover
        if (files?.cover?.[0]) {
            images.cover = await uploadToCloudinary(
                files.cover[0].buffer,
                "restaurants/cover",
                files.cover[0].originalname
            );
        }

        // Upload gallery images
        if (files?.gallery?.length) {
            images.gallery = await Promise.all(
                files.gallery.map((file) =>
                    uploadToCloudinary(
                        file.buffer,
                        "restaurants/gallery",
                        file.originalname
                    )
                )
            );
        }

        // Merge images into body and create restaurant
        const newRestaurant = await createRestaurantService({
            ...body,
            images,
        });

        return successResponse(
            res,
            newRestaurant,
            "Restaurant created successfully",
            StatusCode.Created
        );
    } catch (error: any) {
        return failResponse(
            res,
            error?.message || "Failed to create restaurant",
            StatusCode.Bad_Request
        );
    }
};

// Get all restaurants
export const getAllRestaurants = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const restaurants = await getAllRestaurantsService(req.query as any);
        successResponse(
            res,
            restaurants,
            "Restaurants fetched successfully",
            StatusCode.OK
        );
    } catch (error: any) {
        failResponse(
            res,
            error?.message || "Failed to fetch restaurants",
            StatusCode.Internal_Server_Error
        );
    }
};

// Get a restaurant by ID
export const getRestaurantById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await getRestaurantByIdService(id);

        if (!restaurant) {
            failResponse(res, "Restaurant not found", StatusCode.Not_Found);
            return;
        }

        successResponse(
            res,
            restaurant,
            "Restaurant fetched successfully",
            StatusCode.OK
        );
    } catch (error: any) {
        failResponse(
            res,
            error?.message || "Failed to fetch restaurant",
            StatusCode.Internal_Server_Error
        );
    }
};

// Update a restaurant
export const updateRestaurantController = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;

        // Fetch existing restaurant to preserve old images
        const existingRestaurant = await RestaurantModel.findById(restaurantId);
        if (!existingRestaurant) {
            return failResponse(res, "Restaurant not found", StatusCode.Not_Found);
        }

        const files = req.files as { [key: string]: Express.Multer.File[] };
        const bodyImages = req.body.images ? JSON.parse(req.body.images) : {};

        const images: any = {
            logo: existingRestaurant.images?.logo || null,
            cover: existingRestaurant.images?.cover || null,
            gallery: Array.isArray(existingRestaurant.images?.gallery) ? existingRestaurant.images.gallery : [],
        };

        // Logo
        if (files?.logo?.[0]) {
            images.logo = await uploadToCloudinary(
                files.logo[0].buffer,
                "restaurants/logo",
                files.logo[0].originalname
            );
        } else if (bodyImages.logo) {
            images.logo = bodyImages.logo;
        }

        // Cover
        if (files?.cover?.[0]) {
            images.cover = await uploadToCloudinary(
                files.cover[0].buffer,
                "restaurants/cover",
                files.cover[0].originalname
            );
        } else if (bodyImages.cover) {
            images.cover = bodyImages.cover;
        }

        // Gallery → merge old + new
        if (files?.gallery?.length) {
            const uploadedGallery = await Promise.all(
                files.gallery.map((file) =>
                    uploadToCloudinary(file.buffer, "restaurants/gallery", file.originalname)
                )
            );

            images.gallery = [
                ...(Array.isArray(bodyImages.gallery) ? bodyImages.gallery : []),
                ...uploadedGallery,
            ];
        } else if (bodyImages.gallery) {
            images.gallery = Array.isArray(bodyImages.gallery) ? bodyImages.gallery : [bodyImages.gallery];
        } else {
            images.gallery = [];
        }
        const updateData = { ...req.body };
        delete updateData.images;
        updateData.images = images;

        const updatedRestaurant = await updateRestaurantService(restaurantId, updateData);

        successResponse(res, updatedRestaurant, "Restaurant updated successfully", StatusCode.OK);
    } catch (err) {
        console.error("Error in updateRestaurantController:", err);
        failResponse(res, "Failed to update the restaurant", StatusCode.Internal_Server_Error);
    }
};



//delete a restaurant
export const deleteRestaurantController = async (
    req: Request,
    res: Response
) => {
    try {
        const { restaurantId } = req.params;
        const deletedRestaurant = await deleteRestaurantService(restaurantId);
        successResponse(
            res,
            deletedRestaurant,
            "Restaurant Deleted  successfully",
            StatusCode.OK
        );
    } catch (err) {
        failResponse(
            res,
            "Failed to Delete the  restaurant",
            StatusCode.Internal_Server_Error
        );
    }
};



export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.json({ restaurants: [], products: [] });
    }

    // Fetch restaurant names
    const restaurants = await RestaurantModel.find({
      name: { $regex: query, $options: "i" }
    })
      .limit(5)
      .select("name");

    // Fetch product names
    const products = await Product.find({
      name: { $regex: query, $options: "i" }
    })
      .limit(5)
      .select("name");

    res.json({
      restaurants: restaurants.map(r => r.name),
      products: products.map(p => p.name),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};