import { ObjectId } from 'mongoose';
import { IUser } from '../models/interfaces';
import User from '../models/User';
import { EmailSubjects, Messages } from '../utils/constants';
import { buildPaginationQuery, generateEmailVerificationToken, hashToken } from '../utils/appFunctions';

export const getAllUsersService = async (query: { search: string, page: number, limit: number, userType: string, status: string }) => {
    try {
        const { skip, limit, page } = buildPaginationQuery(query)
        const { userType, status, search } = query;

        let searchFilter: any = {
            $and: [
                { isActive: true },
                (userType && { userType: userType }),
                (status && { status: status })

            ].filter((option) => !!option),

            ...(search && {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                ],
            })
        };


        const totalRecords = await User.countDocuments(searchFilter)
        const totalPages = Math.ceil(totalRecords / limit);
        const hasMore = page < totalPages;

        const selectedFields = `email userType lastName firstName status addresses`
        const users = await User.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(selectedFields)
            .exec(); 
    
        return {
            users,
            meta: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit,
                hasMore,
            }
        };
    } catch (err) {
        console.log('err', err)
        return err;
    }
}


export const createUserService = async (body: IUser): Promise<IUser | any> => {
    try {
        const user = await User.findOne({ email: body.email }, { email: 1 });
        if (user) {
            return {
                message: Messages.Duplicate_Email,
                email: body.email
            };
        }
        const newUser = new User(body);
        const savedUser = await newUser.save();
        savedUser.verificationToken = generateEmailVerificationToken();
        savedUser.hashedToken = hashToken(savedUser.verificationToken!, body.email)
        savedUser.isVerified = false;
        savedUser.createdBy = savedUser._id as ObjectId;
        savedUser.updatedBy = savedUser._id as ObjectId;
        await savedUser.save();
        // await registrationEmail({
        //     email: body.email,
        //     firstName: body.firstName,
        //     lastName: body.lastName,
        //     token: savedUser.verificationToken || ''
        // })
        return savedUser;
    } catch (err) {
        return err;
    }
}



export const deleteUserService = async (id: string) => {
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        return deletedUser;
    } catch (err) {
        return err;
    }
}


export const updateUserService = async (id: string, data: any) => {
    try {

        const user = await User.find({ _id: id }) as any;
        let newAddress = null;
        let userUpdateObj: any = {
            $set: data
        }
        if (data?.address) {
            newAddress = data?.address;
            delete data?.address;
            userUpdateObj = {
                ...userUpdateObj,
                $push: { addresses: newAddress },
            }
        }
        console.log('userUpdateObj',userUpdateObj);
        const userUpdate = await User.findOneAndUpdate(
            { _id: id },
            userUpdateObj,
            { new: true, runValidators: true, upsert: true }
        );
        return userUpdate;
    } catch (err) {
        return err;
    }
}


export const loginService = async (email: string) => {
    try {
        const selectedFields = `email userType lastName firstName status addresses isVerified password favoriteProducts`
        return await User.findOne({ email }, selectedFields).exec()
    } catch (err) {
        return err;
    }
}


export const getUserByIdService = async (id: string) => {
    try {
        const selectedFields = `email userType lastName firstName status addresses isVerified `
        const user=await User.findOne({ _id: id }, selectedFields);
        console.log('user');
        return user;
    } catch (err) {
        return err;
    }
}

export const findUserByTokenService = async (token: string) => {
    try {
        const user = await User.findOne({
            verificationToken: token,
        });
        if (user) {
            const hashToke = hashToken(token, user?.email);
            if (hashToke === user.hashedToken) {
                user.verificationToken = null;
                user.isVerified = true;
                user.hashedToken = null;
                return await user.save();
            }
            return {
                message: Messages.Invalid_Email_Verification_Token
            }
        }
        return {
            message: Messages.Invalid_Email_Verification_Token
        }

    } catch (err) {
        console.log('error', err)
        return err;
    }
}



export const updateUserAddressService = async (userId: any, newAddress: any) => {
    try {
        // { _id: "123", "addresses.id": "2" }
        // const userAddress = await User.find(
        //     { _id:userId, "addresses._id": newAddress?.id}, // Match the user and address _id
        //     { "addresses.$": 1 } // Use the positional operator to return only the matched address
        //   )

        const updateFields: any = {};
        Object.keys(newAddress).forEach((key) => {
            updateFields[`addresses.$.${key}`] = newAddress[key];
        });
        
        console.log('updateFields', updateFields)
        const userAddress = await User.updateOne(
            { _id: userId, "addresses._id": newAddress?.id },
            {
                $set: updateFields
            }
        )
        return userAddress;
    } catch (err) {
        return err;
    }
}

export const deleteUserAddressService = async (userId: string, addressId: string) => {
    try {
       
        const userAddress = await User.updateOne(
            { _id: userId}, 
            {
              $pull: {
                addresses: { _id: addressId } 
              }
            }
        )
        return userAddress;
    } catch (err) {
        return err;
    }
}