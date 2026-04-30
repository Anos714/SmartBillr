import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/requireAuth.middleware";
import {
  createInvoiceHandler,
  deleteInvoiceById,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceById,
} from "../controllers/invoice.controller";

const router = Router();

router.post("/create", isUserAuthenticated, createInvoiceHandler);
router.get("/all", isUserAuthenticated, getAllInvoices);
router.get("/:id", isUserAuthenticated, getInvoiceById);
router.patch("/update/:id", isUserAuthenticated, updateInvoiceById);
router.delete("/delete/:id", isUserAuthenticated, deleteInvoiceById);

export default router;
