import "dotenv/config";

export const env = {
  PORT: process.env.PORT || 8000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/smartbillr",
};
