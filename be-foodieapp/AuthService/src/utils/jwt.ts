const jwt = require('jsonwebtoken');

// Function to generate a JWT token
export const generateToken = async (user: { _id: string, email: string }) => {
    return await jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN }
    );
};