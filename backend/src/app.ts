import express from "express";
import authRouter from "./routes/auth.route";
import googleAuthRouter from "./routes/googleAuth.route";
import invoiceRouter from "./routes/invoice.route";
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

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", googleAuthRouter);
app.use("/api/v1/invoice", invoiceRouter);

export default app;
