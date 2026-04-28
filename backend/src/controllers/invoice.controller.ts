import { Request, Response } from "express";
import { invoiceSchema } from "../schemas/invoice.schema";
import { Invoice } from "../models/invoice.model";

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

    const invoice = await Invoice.create({
      userId: sub,
      ...payload,
      ...calculatedData,
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
