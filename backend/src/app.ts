import express from "express";

import cookieParser from "cookie-parser";
import helmet from "helmet";
import { corsConfig } from "./config/cors";

const app = express();

//middlewares
app.use(corsConfig());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

export default app;
