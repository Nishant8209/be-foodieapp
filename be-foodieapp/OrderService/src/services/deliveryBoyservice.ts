import DeliveryBoy, { IDeliveryBoy } from '../models/DeliveryBoy';
import mongoose from 'mongoose';

const MAX_DISTANCE_METERS = 5000; // configurable radius

export const findNearestAvailableDeliveryBoy = async (
  coords: [number, number],
  maxDistance = MAX_DISTANCE_METERS
): Promise<IDeliveryBoy | null> => {
  // coords => [lng, lat]
  const deliveryBoy = await DeliveryBoy.findOne({
    isAvailable: true,
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: coords },
        $maxDistance: maxDistance,
      },
    },
  })
    .sort({ activeOrdersCount: 1 })
    .exec();

  return deliveryBoy;
};

export const assignDeliveryBoy = async (deliveryBoyId: mongoose.Types.ObjectId) => {
  // mark assigned: increment activeOrdersCount and mark unavailable if needed
  return DeliveryBoy.findByIdAndUpdate(
    deliveryBoyId,
    { $inc: { activeOrdersCount: 1 }, isAvailable: false },
    { new: true }
  );
};

export const releaseDeliveryBoy = async (deliveryBoyId: mongoose.Types.ObjectId) => {
  if (!deliveryBoyId) return null;
  return DeliveryBoy.findByIdAndUpdate(
    deliveryBoyId,
    {
      $inc: { activeOrdersCount: -1 },
      $set: { isAvailable: true },
    },
    { new: true }
  );
};
