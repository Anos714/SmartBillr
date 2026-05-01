import ImageKit from "@imagekit/nodejs";
import { env } from "./env";

const imagekit = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

export default imagekit;
