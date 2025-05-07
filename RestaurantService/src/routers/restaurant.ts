import { Router } from 'express';
import {createRestaurant, getAllRestaurants, getRestaurantById   } from '../controllers/restaurantController';

const router = Router();

router.get('/',getAllRestaurants)
router.post('/create',createRestaurant);
router.get('/:id',getRestaurantById);



export default router;
