import dotenv from "dotenv";
import { envSchema } from "../schemas/env.schema";

dotenv.config();

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("Invalid environment variables: ", envResult.error.format());
  process.exit(1);
}

export const env = envResult.data;
