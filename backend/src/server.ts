import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting Database");
    process.exit(1);
  });
