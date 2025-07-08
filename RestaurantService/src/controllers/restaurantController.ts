// src/controllers/restaurantController.ts
import { Request, Response } from 'express';
import { createRestaurantService, deleteRestaurantService, getAllRestaurantsService, getRestaurantByIdService, updateRestaurantService } from '../service/restaurantService';
import { successResponse, failResponse } from '../utils/response';
import { StatusCode } from '../utils/StatusCodes';


// Create a new restaurant
    export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
        try {
            const newRestaurant = await createRestaurantService(req.body);
            successResponse(res, newRestaurant, 'Restaurant created successfully', StatusCode.Created);
        } catch (error: any) {
            failResponse(res, error?.message || 'Failed to create restaurant', StatusCode.Bad_Request);
        }
    };


// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {

    try {
        const restaurants = await getAllRestaurantsService(req.query as any);
        successResponse(res, restaurants, 'Restaurants fetched successfully', StatusCode.OK);
    } catch (error: any) {
        failResponse(res, error?.message || 'Failed to fetch restaurants', StatusCode.Internal_Server_Error);
    }
};


// Get a restaurant by ID
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await getRestaurantByIdService(id) ;

        if (!restaurant) {
            failResponse(res, 'Restaurant not found', StatusCode.Not_Found) ;
            return;
        }

        successResponse(res, restaurant, 'Restaurant fetched successfully', StatusCode.OK) ;
    } catch (error: any) {
        failResponse(res, error?.message || 'Failed to fetch restaurant', StatusCode.Internal_Server_Error) ;
    }
};


// Update a restaurant
export const updateRestaurantController = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params ;
        const updatedRestaurant = await updateRestaurantService(restaurantId, req.body) ;
        successResponse(res, updatedRestaurant, 'Restaurant Updated  successfully', StatusCode.OK) ;

    } catch (err) {
        failResponse(res, 'Failed to Update the  restaurant', StatusCode.Internal_Server_Error) ;
    }
};


//delete a restaurant
export const deleteRestaurantController = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params ;
        const deletedRestaurant = await deleteRestaurantService(restaurantId) ;
        successResponse(res, deletedRestaurant, 'Restaurant Deleted  successfully', StatusCode.OK) ;

    } catch (err) {
        failResponse(res, 'Failed to Delete the  restaurant', StatusCode.Internal_Server_Error) ;
    }
};