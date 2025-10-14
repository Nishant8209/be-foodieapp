import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5001"; // Adjust as needed

export const verifyOwnerId = async (ownerId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/user/${ownerId}`);
    return response.status === 200;
  } catch (error: any) {
    return false;
  }
};
