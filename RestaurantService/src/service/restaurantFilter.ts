import { Restaurant } from "../models/interfaces";

export const validateRestaurantInput = (data: Partial<Restaurant>): void => {
    if (!data.name) throw new Error('Restaurant name is required.');
    if (!data.description) throw new Error('Restaurant description is required.');
    if (!data.cuisineTypes || !Array.isArray(data.cuisineTypes) || data.cuisineTypes.length === 0) {
        throw new Error('At least one cuisine type is required.');
    }

    const address = data.address;
    if (!address || !address.addressLine1 || !address.city || !address.state || !address.postalCode || !address.country || !address.coordinates) {
        throw new Error('Complete address with coordinates is required.');
    }

    if (typeof address.coordinates.latitude !== 'number' || typeof address.coordinates.longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers.');
    }

    const contact = data.contactInfo;
    if (!contact || !contact.phone || !contact.email || !contact.name) {
        throw new Error('Phone and email are required in contact info.');
    }

    if (!Array.isArray(data.operatingHours)) {
        throw new Error('Operating hours must be an array.');
    }
    
    data.operatingHours.forEach((hour, index) => {
        if (typeof hour.dayOfWeek !== 'number' || hour.dayOfWeek < 0 || hour.dayOfWeek > 6) {
            throw new Error(`Invalid dayOfWeek at index ${index}.`);
        }

        if (!hour.isClosed && (!hour.open || !hour.close)) {
            throw new Error(`Open and close times required for day index ${index} unless marked closed.`);
        }
    });
};