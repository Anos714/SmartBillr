import { Document, Schema, model } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  isUserVerified: boolean;
  tokenVersion: number;
  emailVerifyToken: string | undefined;
  emailVerifyTokenExpiry: Date | undefined;
  lastVerificationSentAt: Date | undefined;
  emailVerifiedAt: Date | undefined;
  resetPassToken: string | undefined;
  resetPassTokenExpiry: Date | undefined;
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
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    isUserVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    emailVerifyToken: { type: String, default: undefined },
    emailVerifyTokenExpiry: { type: Date, default: undefined },
    lastVerificationSentAt: { type: Date, default: undefined },
    emailVerifiedAt: { type: Date, default: undefined },
    resetPassToken: { type: String, default: undefined },
    resetPassTokenExpiry: { type: Date, default: undefined },
  },
  { timestamps: true },
);

//indexes
UserSchema.index({
  emailVerifyToken: 1,
  emailVerifyTokenExpiry: 1,
});

export const User = model("User", UserSchema);
