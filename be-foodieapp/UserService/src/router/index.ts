
import { Router } from 'express';
import {  createUser, deleteUser, deleteUserAddress, getUserById, getUsers, updateUser, updateUserAddress, verifyEmail } from '../controllers/usercontrollers';
import upload from '../utils/upload';

const router = Router();

router.get('/', getUsers);
router.post('/create',upload.single('profilePic'), createUser);
router.delete('/:id', deleteUser)
router.put('/:id',upload.single('profilePic'), updateUser);
router.get('/email/verifyToken', verifyEmail);
router.get('/:id',  getUserById);

router.put('/updateAddress/:userId',  updateUserAddress)
router.put('/deleteAddress/:userId',  deleteUserAddress)

export default router;