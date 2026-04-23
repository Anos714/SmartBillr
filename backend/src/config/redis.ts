import { createClient } from "redis";
import { env } from "./env";

const client = createClient({
  url: env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis connected");
  }
}

export default client;
