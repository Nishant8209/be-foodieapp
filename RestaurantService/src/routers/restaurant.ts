import { Router } from 'express';
import {createRestaurant, deleteRestaurantController, getAllRestaurants, getRestaurantById, updateRestaurantController   } from '../controllers/restaurantController';

const   router = Router();

router.get('/',getAllRestaurants)
router.post('/create',createRestaurant);
router.get('/:id',getRestaurantById);
router.put('/:restaurantId',updateRestaurantController); // Assuming you want to update a restaurant by ID as well
router.delete('/:restaurantId',deleteRestaurantController); // Assuming you want to delete a restaurant by ID as well

export default router;
