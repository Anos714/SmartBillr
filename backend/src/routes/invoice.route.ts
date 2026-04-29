import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import {
  createInvoiceHandler,
  //   getAllInvoices,
} from "../controllers/invoice.controller";

const router = Router();

router.post("/create-invoice", isUserAuthenticated, createInvoiceHandler);
// router.get("/invoices", isUserAuthenticated, getAllInvoices);

export default router;
