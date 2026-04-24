import { Router } from "express";
import {
  changePasswordHandler,
  forgotPasswordHandler,
  getMe,
  logoutHandler,
  refreshTokenHandler,
  resendVerificationEmail,
  resetPasswordHandler,
  signinUser,
  signupUser,
  verifyEmailToken,
} from "../controllers/auth.controller";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";

const router = Router();

router.post("/signup", signupUser);
router.post("/signin", signinUser);

// email verification
router.post("/verify-email", verifyEmailToken);
router.post("/resend-email-verify", resendVerificationEmail);

// password
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/change-password", isUserAuthenticated, changePasswordHandler);

// auth
router.post("/refresh", isUserAuthenticated, refreshTokenHandler);
router.post("/logout", logoutHandler);
router.get("/me", isUserAuthenticated, getMe);

export default router;
