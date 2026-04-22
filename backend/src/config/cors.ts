import { env } from "./env";
import cors from "cors";
export const corsConfig=():Co=>{
    return cors({
        origin: env.FRONTEND_URL,
        methods:["GET","POST","PUT","DELETE","PATCH"],
        allowedHeaders:["Content-Type","Authorization"],
        exposedHeaders:["Content-Type","Authorization"],
        maxAge: 600,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
      })
}