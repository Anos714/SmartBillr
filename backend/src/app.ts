import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

//midllewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

export default app;
