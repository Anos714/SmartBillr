import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import { createInvoiceHandler } from "../controllers/invoice.controller";

const router = Router();

router.post("/create-invoice", isUserAuthenticated, createInvoiceHandler);

export default router;
