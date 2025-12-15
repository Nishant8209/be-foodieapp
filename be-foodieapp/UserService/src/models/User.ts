import { Schema, model } from 'mongoose';
import { DeliveryStatus, IUser, Status, UserType } from './interfaces';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const addressSchema = new Schema(
  {
    // optional label + type for UI
    name: { type: String, required: false },
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    // Map your interface fields
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }, // interface zipCode
    country: { type: String, required: true },

    // GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    phone: {
      type: String,
      required: true,
      minlength: [10, "Phone number must be at least 10 digits long"],
      maxlength: [15, "Phone number cannot exceed 15 digits"],
      validate: {
        validator: function (v: string) {
          return /^\d+$/.test(v);
        },
        message: (props: any) =>
          `${props?.value} is not a valid phone number! Phone number should contain only digits.`,
      },
    },

    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

// ----------------------------------------
// User schema
// ----------------------------------------
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
      default: UserType.CUSTOMER,
    },

    profilePic: {
      type: String,
      required: false,
    },

    addresses: {
      type: [addressSchema],
      required: false,
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    tokenCreatedAt: {
      type: Date,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    hashedToken: {
      type: String,
      default: null,
    },

    favoriteProducts: {
      type: [String],
      default: [],
    },

    // Delivery-only fields
    deliveryStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
      required: false,
    } as unknown as { type: DeliveryStatus }, // TS hint

    maxConcurrentOrders: {
      type: Number,
      default: 1,
      required: false,
    },

    currentOrderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

   currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: false,
      },
    },

    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Active,
    },

    version: { type: Number, default: 1 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------------------------
// Password hash hooks
// ----------------------------------------
userSchema.pre("save", async function (next) {
  const doc = this as any;

  if (!doc.isModified("password")) return next();

  const saltRounds = Number(process.env.PASSWORD_SALT || 10);
  const salt = await bcrypt.genSalt(saltRounds);
  doc.password = await bcrypt.hash(doc.password, salt);

  next();
});

userSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  const update = this.getUpdate() as any;
  const password = update?.$set?.password ?? update?.password;

  if (password) {
    const saltRounds = Number(process.env.PASSWORD_SALT || 10);
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (update.$set) {
      update.$set.password = hashedPassword;
    } else {
      update.password = hashedPassword;
    }
  }

  // always bump updatedAt
  if (!update.$set) update.$set = {};
  update.$set.updatedAt = new Date();

  next();
});

// ----------------------------------------
// Indexes
// ----------------------------------------

// Geo index for address location
userSchema.index({ "addresses.location": "2dsphere" });

// Geo index for currentLocation (delivery boy live location)
userSchema.index({ currentLocation: "2dsphere" });

// For faster lookup by email + userType
userSchema.index({ email: 1, userType: 1 }, { unique: true });

// ----------------------------------------
// Model export
// ----------------------------------------
const User = model<IUser>("User", userSchema);
export default User;