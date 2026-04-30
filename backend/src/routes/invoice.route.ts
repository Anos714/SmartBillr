import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import {
  createInvoiceHandler,
  getAllInvoices,
  getInvoiceById,
} from "../controllers/invoice.controller";

const router = Router();

router.post("/create-invoice", isUserAuthenticated, createInvoiceHandler);
router.get("/invoices", isUserAuthenticated, getAllInvoices);
router.get("/invoice/:id", isUserAuthenticated, getInvoiceById);

export default router;
