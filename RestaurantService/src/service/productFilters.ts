  import { FilterQuery, Types } from 'mongoose';
  import { IProduct } from '../models/product';

  // Function to build the filter object
  export const buildFilter = async (query: any): Promise<FilterQuery<IProduct>> => {
    const filter: FilterQuery<IProduct> = {};
    try {
      const { category, name, minPrice, maxPrice,  isPopular,restaurantId } = query;


      console.log("restaurantId", restaurantId,category)
   


    
      // Filter by restaurantId
      if (restaurantId && Types.ObjectId.isValid(restaurantId)) {
        filter.restaurantId = new Types.ObjectId(restaurantId);
      }
      // Filter by category
      if (category) {
        filter.category = category;
      }
  
      // Search by product name using regex (case-insensitive)
      if (name) {
        let queryName = name.replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
        queryName = decodeURIComponent(queryName);
        filter.name = { $regex: queryName, $options: 'i' };
      }
      // Filter by price range
      if (minPrice || maxPrice) {
        filter.price = {};
        console.log('minPrice', minPrice);
        console.log('maxPrice', maxPrice);
        if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
      }

      // Is Popular 
      if (isPopular) {
        filter.isPopular = (isPopular == "true");
      }
  
      return filter;

    } catch (err) {
      console.log('Filter Query Err', err)
      return filter;
    }

  };

  // Function to get sort option
  export const getSortOption = (sortBy: string | undefined): { [key: string]: 1 | -1 } => {
    switch (sortBy) {
      case 'priceLowToHigh':
        return { price: 1 };
      case 'priceHighToLow':
        return { price: -1 };
      case 'nameAToZ':
        return { name: 1 };
      case 'nameZToA':
        return { name: -1 };
      default:
        return { createdAt: -1 };
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
    const sortOption = getSortOption(sortBy);
    const { limitNum, skip } = getPagination(page, limit);

    return [
      { $match: filter }, // Apply the updated filters


      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          discount: 1,
          stock: 1,
          category: 1,
          images: 1,
          isPopular: 1,
          ingredients: 1,
          rating: 1,  
          availability: 1,
          isVeg: 1,
          deliveryTime: 1,
          servingSize: 1,
          orderCount: 1,  
          isDiscounted: 1,
          specialInstructions: 1,
          spiceLevel: 1,
          tags: 1,
          cookingTime: 1,
          restaurantId: 1,
        
        },
      },

      { $sort: sortOption },
      { $skip: skip },
      { $limit: limitNum },
    ];
  };

