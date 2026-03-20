import { model, Schema } from "mongoose";
import type { IInvoice, IItem } from "./invoice.type.js";

const ItemSchema = new Schema<IItem>(
  {
    id: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
    },

    //business info
    business: {
      businessName: {
        type: String,
        required: true,
      },
      businessEmail: {
        type: String,
        required: true,
      },
      businessAddress: {
        type: String,
        required: true,
      },
      businessPhone: {
        type: String,
        required: true,
      },
      gstNumber: {
        type: String,
        default: "",
      },
    },

    //client info
    client: {
      clientName: {
        type: String,
        required: true,
      },
      clientEmail: {
        type: String,
        required: true,
      },
      clientAddress: {
        type: String,
        required: true,
      },
      clientPhone: {
        type: String,
        required: true,
      },
    },

    //items
    items: {
      type: [ItemSchema],
      required: true,
    },

    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },
    status: {
      type: String,
      enum: ["Draft", "Unpaid", "Paid", "Overdue"],
      default: "Draft",
    },

    //for assets(images)
    stampUrl: {
      type: String,
      default: "",
    },
    signUrl: {
      type: String,
      default: "",
    },
    companyLogoUrl: {
      type: String,
      default: "",
    },
    signOwnerName: {
      type: String,
      default: "",
    },
    signOwnerTitle: {
      type: String,
      default: "",
    },

    subTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  { timestamps: true },
);

export const Invoice = model("Invoice", InvoiceSchema);
