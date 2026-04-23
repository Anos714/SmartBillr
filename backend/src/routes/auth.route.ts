import { Router } from "express";
import {
  resendVerificationEmail,
  signinUser,
  signupUser,
  verifyEmailToken,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.get("/email-verify", verifyEmailToken);
router.post("/resend-email-verify", resendVerificationEmail);

export default router;
