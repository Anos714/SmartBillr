import { Request, Response } from "express";
import { invoiceSchema } from "../schemas/invoice.schema";
import { Invoice } from "../models/invoice.model";
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
      errors: result.error.flatten(),
    });
  }

  const payload = result.data;

  try {
    const calculatedData = calculateInvoiceTotals(
      payload.items,
      payload.discount,
    );

    const invoiceNum =payload.invoiceNumber|| generateInvoiceNumber();

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

// export const getAllInvoices = async (req: Request, res: Response) => {
//   const { sub } = req.user;
//   const page=0;
//   const limit=;
//   const skip;
//   try {
//     const invoices = await Invoice.find({ userId: sub });
//     return res.status(200).json({
//       success: true,
//       data: invoices,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error,
//     });
//   }
// };
