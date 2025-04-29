import { Request, Response } from "express";
import { IUser } from "../models/interfaces";
import { loginService } from "../service/authService";
import { comparePasswords } from "../utils/passwordValidation";
import { failResponse, successResponse } from "../utils/response";
import { StatusCode } from "../utils/StatusCodes";
import { generateToken } from "../utils/jwt";
import { JWT_TOKEN_NAME, Messages } from "../utils/constants";

// POST login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const credentials = req.body as { email: string, password: string };
        const userInfo: IUser | any = await loginService(credentials?.email);
        if (!userInfo) {
            failResponse(res, Messages.User_Not_Available, StatusCode.Not_Found);
            return;
        }
        if (userInfo?.password) {
            const password = await comparePasswords(credentials.password, userInfo.password);
            if (!password) {
                failResponse(res, Messages.Unauthorized_User, StatusCode.Unauthorized);
                return;
            }
        } else {
            failResponse(res, Messages.Unauthorized_User, StatusCode.Unauthorized);
            return;
        }
        const token = await generateToken(userInfo);
        res.cookie(`${JWT_TOKEN_NAME}`, token, {
            httpOnly: true,
            secure: true, // Only on HTTPS in production
            sameSite: 'none'
        });
        successResponse(res, { userInfo, token }, Messages.UserAuthenticated, StatusCode.OK);
    } catch (err: any) {
        failResponse(res, err?.message || err, StatusCode.Bad_Request)
    }
}


//logout User
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie(`${JWT_TOKEN_NAME}`);
        successResponse(res, '', Messages.Logout, StatusCode.OK);
    } catch (err) {
        failResponse(res, Messages.Something_went_Wrong, StatusCode.Not_Found)
    }

}