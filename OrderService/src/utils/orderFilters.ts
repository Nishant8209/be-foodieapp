import { FilterQuery, Types } from 'mongoose';
import { IOrder } from '../models/interface';

// Function to build the filter object
export const buildFilter = async (query: any): Promise<FilterQuery<IOrder>> => {
  const filter: FilterQuery<IOrder> = {};
  try {
    const { userId, restaurantId, status } = query;

 
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }


    if (restaurantId && Types.ObjectId.isValid(restaurantId)) {
      filter.restaurantId = new Types.ObjectId(restaurantId);
    }


    if (status) {
      filter.status = status;
    }

    return filter;

  } catch (err) {
    console.log('Filter Query Err', err)
    return filter;
  }

};


// Function for pagination
export const getPagination = (page: number, limit: number) => {
  const pageNum = parseInt(page as unknown as string, 10) || 1;
  const limitNum = parseInt(limit as unknown as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};

// Aggregation pipeline builder
export const buildProductAggregationPipeline = async (
  filterQuery: any,
  sortBy: string | undefined,
  page: number,
  limit: number
) => {
  const filter = await buildFilter(filterQuery);

  const { limitNum, skip } = getPagination(page, limit);

  return [
    { $match: filter }, // Apply the updated filters


    {
      $project: {
        userId: 1,
        restaurantId: 1,
        items: 1,
        totalPrice: 1,
        status: 1,
        deliveryAddress: 1,
        createdAt: 1,
        updatedAt: 1,
        paymentInfo: 1,
      },
    },


    { $skip: skip },
    { $limit: limitNum },
  ];
};
