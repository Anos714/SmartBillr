import { Schema, model } from "mongoose";

// 🔹 BUSINESS
export interface IBusiness extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoURL?: string;
  stampURL?: string;
  signURL?: string;
  gstNumber?: string;
  ownerName?: string;
  ownerDesignation?: string;
  defaultTax?: number;
}

interface IImage {
  url: string;
  publicId: string;
}

const imageSchema = new Schema<IImage>({
  url: String,
  publicId: String,
});

const BusinessInfoSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    logoURL: {
      type: imageSchema,
      default: null,
    },
    stampURL: {
      type: imageSchema,
      default: null,
    },
    signURL: {
      type: imageSchema,
      default: null,
    },
    gstNumber: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    ownerDesignation: { type: String, required: true },
    defaultTax: { type: Number, default: 18 },
  },
  { timestamps: true },
);

export const BusinessInfo = model("BusinessInfo", BusinessInfoSchema);
