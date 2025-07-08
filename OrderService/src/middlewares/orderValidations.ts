import { body } from 'express-validator';

export const validateOrder = [
    
    body('userId').notEmpty().withMessage('userId is required'),
    body('items').notEmpty().withMessage('items are required'),
    body('restaurantId').notEmpty().withMessage('restaurantId is required'),
    body('deliveryAddress').notEmpty().withMessage('deliveryAddress Address is required'),
    body('paymentStatus').notEmpty().withMessage('paymentStatus is required'),
    body('totalPrice').notEmpty().isNumeric().withMessage('totalPrice is required')
];

