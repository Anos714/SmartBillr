import { Document, Schema, model } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  isUserVerified: boolean;
  tokenVersion: number;
  resetPassToken: string | undefined;
  resetPassTokenExpiry: string | undefined;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], deafult: "user" },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    isUserVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      deafult: 0,
    },
    resetPassToken: { type: String, default: undefined },
    resetPassTokenExpiry: { type: Date, default: undefined },
  },
  { timestamps: true },
);

export const User = model("User", UserSchema);
