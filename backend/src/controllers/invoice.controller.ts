import { Request, Response } from "express";
import { invoiceSchema, updateInvoiceSchema } from "../schemas/invoice.schema";
import { IInvoice, Invoice, InvoiceStatus } from "../models/invoice.model";
import mongoose, { QueryFilter, SortOrder } from "mongoose";
import { success } from "zod";

interface ItemInput {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  tax: number;
}

const round = (num: number) => Math.round(num * 100) / 100;

export const calculateInvoiceTotals = (items: ItemInput[], discount = 0) => {
  const calculatedItems = items.map((item) => {
    const baseAmount = item.quantity * item.price;
    const taxAmount = (baseAmount * item.tax) / 100;

    return {
      ...item,
      total: round(baseAmount + taxAmount),
    };
  });

  const subtotal = round(
    items.reduce((acc, item) => acc + item.quantity * item.price, 0),
  );

  const taxAmount = round(
    items.reduce((acc, item) => {
      const baseAmount = item.quantity * item.price;
      return acc + (baseAmount * item.tax) / 100;
    }, 0),
  );

  const grossAmount = round(subtotal + taxAmount);

  if (discount > grossAmount) {
    throw new Error("Discount cannot exceed invoice total");
  }

  const totalAmount = round(grossAmount - discount);

  return {
    items: calculatedItems,
    subtotal,
    taxAmount,
    discount,
    totalAmount,
  };
};

export const generateInvoiceNumber = () => {
  const prefix = "INV";
  const date = new Date();
  const year = date.getFullYear();
  const randomPart = Math.floor(Math.random() * 999) + 100;
  const suffix = Date.now().toString().slice(6);

  return `${prefix}-${year}-${randomPart}${suffix}`;
};

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const { sub } = req.user;

  const result = invoiceSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
    });
  }

  const payload = result.data;

  try {
    const calculatedData = calculateInvoiceTotals(
      payload.items,
      payload.discount,
    );

    const invoiceNum = payload.invoiceNumber || generateInvoiceNumber();

    const invoice = await Invoice.create({
      userId: sub,

      ...payload,
      ...calculatedData,
      invoiceNumber: invoiceNum,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Discount")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const allowedStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { sub } = req.user;
    const { page = "1", limit = "10", status, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query: QueryFilter<IInvoice> = {
      userId: sub,
      isDeleted: false,
    };

    if (status) {
      const statusValue = String(status);

      if (!allowedStatuses.includes(statusValue as InvoiceStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid invoice status",
        });
      }

      query.status = statusValue;
    }

    const searchText = typeof search === "string" ? search.trim() : "";

    if (searchText) {
      query.$text = { $search: searchText };
    }

    const projection = searchText ? { score: { $meta: "textScore" } } : {};

    const sort: Record<string, SortOrder | { $meta: any }> = searchText
      ? { score: { $meta: "textScore" } }
      : { createdAt: -1 };

    const [invoices, total] = await Promise.all([
      Invoice.find(query, projection)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select("-__v")
        .lean(),

      Invoice.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const invoiceId = req.params.id;

    if (!invoiceId || Array.isArray(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invoice id is missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice id",
      });
    }

    const invoice = await Invoice.findOne({
      userId: req.user.sub,
      _id: invoiceId,
      isDeleted: false,
    })
      .select("-__v")
      .lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get invoice by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

type InvoiceParams = {
  id: string;
};

export const updateInvoiceById = async (
  req: Request<InvoiceParams>,
  res: Response,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const invoiceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice id",
      });
    }

    const result = updateInvoiceSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
      });
    }

    const payload = result.data;

    let calculatedData = {};

    if (payload.items) {
      calculatedData = calculateInvoiceTotals(
        payload.items,
        payload.discount ?? 0,
      );
    }

    const invoiceNum = payload.invoiceNumber || generateInvoiceNumber();

    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,
        userId: req.user.sub,
        isDeleted: false,
      },
      {
        ...payload,
        ...calculatedData,
        invoiceNumber: invoiceNum,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .select("-__v")
      .lean();

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Update invoice by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
