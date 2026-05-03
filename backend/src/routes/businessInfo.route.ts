import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import {
  getBusinessInfoHandler,
  deleteBusinessInfoHandler,
  saveBusinessInfoHandler,
} from "../controllers/businessInfo.controller";

const router = Router();

// save/update business info
router.put("/save", isUserAuthenticated, saveBusinessInfoHandler);

// get business info
router.get("/get", isUserAuthenticated, getBusinessInfoHandler);

// optional: delete business profile
router.delete("/delete", isUserAuthenticated, deleteBusinessInfoHandler);

export default router;
