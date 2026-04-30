import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import {
  createInvoiceHandler,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceById,
} from "../controllers/invoice.controller";

const router = Router();

router.post("/create", isUserAuthenticated, createInvoiceHandler);
router.get("/all", isUserAuthenticated, getAllInvoices);
router.get("/:id", isUserAuthenticated, getInvoiceById);
router.put("/update/:id", isUserAuthenticated, updateInvoiceById);

export default router;
