import User from '../models/User';

export const loginService = async (email: string) => {
    try {
        const selectedFields = `email userType lastName firstName status addresses isVerified password favoriteProducts`
        return await User.findOne({ email }, selectedFields).exec()
    } catch (err) {
        return err;
    }
}
