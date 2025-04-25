
import { Router } from 'express';
import {  createUser, deleteUser, deleteUserAddress, getUserById, getUsers, updateUser, updateUserAddress, verifyEmail } from '../controllers/usercontrollers';

const router = Router();

router.get('/', getUsers);
router.post('/create', createUser);
router.delete('/:id', deleteUser)
router.put('/:id', updateUser);
router.get('/email/verifyToken', verifyEmail);
router.get('/:id',  getUserById);

router.put('/updateAddress/:userId',  updateUserAddress)
router.put('/deleteAddress/:userId',  deleteUserAddress)

export default router;