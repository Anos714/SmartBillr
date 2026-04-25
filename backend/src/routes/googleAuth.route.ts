import { Router } from "express";
import { googleAuthHandler } from "../controllers/googleAuth.controller";

const router = Router();

router.post("/google-login", googleAuthHandler);

export default router;
