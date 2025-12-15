// src/services/deliveryClient.ts
import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL as string;

type DeliveryBoyApiResponse =
  | {
      status: "Success";
      message: string;
      data: {
        _id: string;
        deliveryStatus: string;
        currentLocation: any;
      };
    }
  | {
      status: "NoRider" | "Error";
      message: string;
      data: null;
    };

export async function findNearestAvailableDeliveryBoy(
  coords: [number, number]
): Promise<DeliveryBoyApiResponse> {
  const [lng, lat] = coords;
  const res = await axios.get<DeliveryBoyApiResponse>(
    `${USER_SERVICE_URL}/delivery/available`,
    { params: { lng, lat } }
  );
  return res.data;
}

export async function setDeliveryBoyStatus(
  deliveryBoyId: string,
  status: "available" | "busy" | "offline"
) {
  await axios.put(`${USER_SERVICE_URL}/delivery/${deliveryBoyId}/status`, {
    status,
  });
}


