import "dotenv/config";

export const env = {
  PORT: process.env.PORT || 8000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/smartbillr",
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  API_BASE_URL: process.env.API_BASE_URL,
};
