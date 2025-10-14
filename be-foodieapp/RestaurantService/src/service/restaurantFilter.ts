import { Restaurant } from "../models/interfaces";

export const validateRestaurantInput = (data: Partial<Restaurant>): void => {

  // Basic fields
  if (!data.name) throw new Error("Restaurant name is required.");
  if (!data.description) throw new Error("Restaurant description is required.");

  // Parse cuisineTypes if it's a string
  let cuisineTypes: string[] = [];
  try {
    cuisineTypes = Array.isArray(data.cuisineTypes)
      ? data.cuisineTypes
      : data.cuisineTypes
      ? JSON.parse(data.cuisineTypes)
      : [];
  } catch (err) {
    throw new Error("Invalid cuisineTypes format. It should be an array.");
  }

  if (!Array.isArray(cuisineTypes) || cuisineTypes.length === 0) {
    throw new Error("At least one cuisine type is required.");
  }

  // Parse address if it's a string
  let address = data.address;
  if (typeof address === "string") {
    try {
      address = JSON.parse(address);
    } catch (err) {
      throw new Error("Invalid address format. It should be an object.");
    }
  }

  if (
    !address ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !address.postalCode ||
    !address.country ||
    !address.location ||
    !Array.isArray(address.location.coordinates)
  ) {
    throw new Error("Complete address with valid coordinates is required.");
  }

  // Validate coordinates [longitude, latitude]
  if (
    address.location.coordinates.length !== 2 ||
    !address.location.coordinates.every((coord) => typeof coord === "number")
  ) {
    throw new Error(
      "Coordinates must be an array of two numbers [longitude, latitude]."
    );
  }

  const [lng, lat] = address.location.coordinates;
  if (lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180.");
  }
  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90.");
  }

  // Parse contactInfo if it's a string
  let contact = data.contactInfo;
  if (typeof contact === "string") {
    try {
      contact = JSON.parse(contact);
    } catch (err) {
      throw new Error("Invalid contactInfo format. It should be an object.");
    }
  }

  if (!contact || !contact.phone || !contact.email || !contact.name) {
    throw new Error("Name, phone, and email are required in contact info.");
  }

  // Parse operatingHours if it's a string
  let operatingHours = data.operatingHours;
  if (typeof operatingHours === "string") {
    try {
      operatingHours = JSON.parse(operatingHours);
    } catch (err) {
      throw new Error("Invalid operatingHours format. It should be an array.");
    }
  }

  if (!Array.isArray(operatingHours)) {
    throw new Error("Operating hours must be an array.");
  }

  operatingHours.forEach((hour, index) => {
    if (typeof hour.dayOfWeek !== "number" || hour.dayOfWeek < 0 || hour.dayOfWeek > 6) {
      throw new Error(`Invalid dayOfWeek at index ${index}.`);
    }

    if (!hour.isClosed && (!hour.open || !hour.close)) {
      throw new Error(
        `Open and close times required for day index ${index} unless marked closed.`
      );
    }
  });
};
