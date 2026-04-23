import { Router } from "express";
import {
  refreshTokenHandler,
  resendVerificationEmail,
  signinUser,
  signupUser,
  verifyEmailToken,
} from "../controllers/auth.controller";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";

const router = Router();

router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.get("/email-verify", verifyEmailToken);
router.post("/resend-email-verify", resendVerificationEmail);
router.post("/refresh", isUserAuthenticated, refreshTokenHandler);

export default router;
