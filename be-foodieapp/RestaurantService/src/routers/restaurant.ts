import { Router } from 'express';
import {createRestaurant, deleteRestaurantController, getAllRestaurants, getRestaurantById, updateRestaurantController   } from '../controllers/restaurantController';
import upload from '../utils/upload';

const   router = Router();

// multiple uploads: logo, cover, gallery[]
const cpUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);
router.get('/',getAllRestaurants)
router.post('/create',cpUpload,createRestaurant);
router.get('/:id',getRestaurantById);
router.put('/:restaurantId',cpUpload,updateRestaurantController); // Assuming you want to update a restaurant by ID as well
router.delete('/:restaurantId',deleteRestaurantController); // Assuming you want to delete a restaurant by ID as well

export default router;
