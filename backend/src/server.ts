import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";

connectDB()
  .then(async () => {
    await connectRedis();
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting Database");
    process.exit(1);
  });
