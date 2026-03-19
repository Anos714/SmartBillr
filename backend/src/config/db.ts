import mongoose from "mongoose";
import { env } from "./env.js";

export const connectToDb = async () => {
  try {
    mongoose.connect(env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};
