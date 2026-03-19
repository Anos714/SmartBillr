import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDb } from "./config/db.js";

const PORT = env.PORT;

connectToDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
    process.exit(1);
  });
