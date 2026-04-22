import { Router } from "express";
import { signupUser, verifyEmailToken } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signupUser);
router.get("/email-verify", verifyEmailToken);

export default router;
