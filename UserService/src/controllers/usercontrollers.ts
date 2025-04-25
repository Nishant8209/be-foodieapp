import { Request, Response } from 'express';
import { getAllUsersService, createUserService, deleteUserService, updateUserService, getUserByIdService, findUserByTokenService, updateUserAddressService, deleteUserAddressService } from '../services/userService';
import { IUser } from '../models/interfaces';
import { failResponse, successResponse } from '../utils/response';
import { StatusCode } from '../utils/StatusCodes';
import { Messages, UserAddressFields } from '../utils/constants';


export interface UserQuery { search: string, page: number, limit: number, userType: string }

// GET all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService(req.query as any);
       successResponse(res, users, '', StatusCode.OK);
  } catch (error: any) {
    failResponse(res, error?.message || error, StatusCode.Bad_Request)
  }
};

// POST create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const newUser: IUser | any = await createUserService({ ...req.body, createdBy: null, updatedBy: null });
    if (newUser?.message === Messages.Duplicate_Email || !newUser?.email) {
      failResponse(res, newUser?.message, StatusCode.Bad_Request)
      return;
    }
    successResponse(res, newUser, Messages.User_Created, StatusCode.Created);
  } catch (error: any) {
    failResponse(res, error?.message || error, StatusCode.Bad_Request)
  }
     
};


// Delete delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const newUser: IUser | any = await deleteUserService(id);
    if (newUser?.message) {
      failResponse(res, newUser?.message, StatusCode.Bad_Request)
      return;
    }
    successResponse(res, { email: newUser?.email }, Messages.User_Deleted, StatusCode.OK);
  } catch (error: any) {
    failResponse(res, error?.message || error, StatusCode.Bad_Request)
  }
};

// Put update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const updatedUser: IUser | any = await updateUserService(id, req.body);
    if (updatedUser?.message) {
      failResponse(res, updatedUser?.message, StatusCode.Bad_Request);
      return
    }
    successResponse(res, updatedUser, Messages.User_Updated, StatusCode.OK);
  } catch (err: any) {
    console.log('err', err)
    failResponse(res, err?.message || err, StatusCode.Bad_Request)
  }
}

// Get user By Id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    console.log('id',id);
    const user: IUser | any = await getUserByIdService(id);
   
    if (user?.message) {
      failResponse(res, user?.message, StatusCode.Bad_Request);
      return
    }
    successResponse(res, user, Messages.User_Updated, StatusCode.OK);
  } catch (err: any) {
    console.log('err', err)
    failResponse(res, err?.message || err, StatusCode.Bad_Request)
  }
}


// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token: string = (req.query.token! || '') as string;
    console.log('token', token, req.params)
    const user: any = await findUserByTokenService(token);
    console.log('user', user);
    if (user?.message) {
      failResponse(res, user?.message, StatusCode.Bad_Request);
      return
    }
    successResponse(res, '', Messages.Email_Verified, StatusCode.OK);
  } catch (err: any) {
    console.log('err', err)
    failResponse(res, err?.message || err, StatusCode.Bad_Request)
  }
}

//Update the User Address 
export const updateUserAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const newAddress = req.body;
    if (!userId) {
      failResponse(res, Messages.UserId_Required_To_Update_Address, StatusCode.Bad_Request)
      return;
    }
    if (!newAddress?.id) {
      failResponse(res, Messages.AddressId_Required_To_Update_Address, StatusCode.Bad_Request)
      return;
    }

    if (newAddress) {
      Object.keys(newAddress).forEach((key) => {
        if (!UserAddressFields.includes(key)) {
          delete newAddress[key];
        }
      });
    }

    const userAddressUpdated = await updateUserAddressService(userId, newAddress);
    successResponse(res, newAddress, Messages.Address_Updated, StatusCode.OK);
  } catch (err: any) {
    failResponse(res, err?.message || err, StatusCode.Bad_Request)
  }
}

// Delete the  User Address
export const deleteUserAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { id } = req.body;
    if (!userId) {
      failResponse(res, Messages.UserId_Required_To_Delete_Address, StatusCode.Bad_Request)
      return;
    }
    if (!id) {
      failResponse(res, Messages.AddressId_Required_To_Update_Address, StatusCode.Bad_Request)
      return;
    }

    const userAddressUpdated = await deleteUserAddressService(userId, id);
    successResponse(res, { id }, Messages.Address_Deleted, StatusCode.OK);
  } catch (err: any) {
    failResponse(res, err?.message || err, StatusCode.Bad_Request)
  }
}