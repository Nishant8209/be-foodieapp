// src/controllers/restaurantController.ts
import { Request, Response } from 'express';
import { createRestaurantService, getAllRestaurantsService, getRestaurantByIdService } from '../service/restaurantService';
import { successResponse, failResponse } from '../utils/response';
import { StatusCode } from '../utils/StatusCodes';

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const newRestaurant = await createRestaurantService(req.body);
        successResponse(res, newRestaurant, 'Restaurant created successfully', StatusCode.Created);
    } catch (error: any) {
        failResponse(res, error?.message || 'Failed to create restaurant', StatusCode.Bad_Request);
    }
};
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
    console.log('sdshhdhSH')
    try {
        const restaurants = await getAllRestaurantsService(req.query as any);
        successResponse(res, restaurants, 'Restaurants fetched successfully', StatusCode.OK);
    } catch (error: any) {
        failResponse(res, error?.message || 'Failed to fetch restaurants', StatusCode.Internal_Server_Error);
    }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await getRestaurantByIdService(id);

        if (!restaurant) {
            failResponse(res, 'Restaurant not found', StatusCode.Not_Found);
            return;
        }

        successResponse(res, restaurant, 'Restaurant fetched successfully', StatusCode.OK);
    } catch (error: any) {
        failResponse(res, error?.message || 'Failed to fetch restaurant', StatusCode.Internal_Server_Error);
    }
};