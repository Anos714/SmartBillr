import { Schema, Types, model } from "mongoose";

// 🔹 BUSINESS
export interface IBusiness {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoURL?: string;
  stampURL?: string;
  signURL?: string;
  gstNumber?: string;
  ownerName?: string;
  ownerDesignation?: string;
  defaultTax?: number;
}

// 🔹 CLIENT
export interface IClient {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

// 🔹 ITEM
export interface IItem {
  name: string;
  description?: string;

  quantity: number;
  price: number;
  tax?: number;

  total: number;
}

// 🔹 PAYMENT
export type PaymentMethod = "cash" | "bank" | "upi" | "card";

export interface IPaymentDetails {
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
}

export interface IPayment {
  paymentMethod?: PaymentMethod;
  paymentDetails?: IPaymentDetails;
}

// 🔹 INVOICE STATUS
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

// 🔹 MAIN INVOICE
export interface IInvoice {
  _id?: Types.ObjectId;

  userId: Types.ObjectId;

  business: IBusiness;
  client: IClient;

  invoiceNumber: string;
  status?: InvoiceStatus;

  issueDate: Date;
  dueDate: Date;

  currency?: "INR" | "USD";

  items: IItem[];

  subtotal: number;
  taxAmount?: number;
  discount?: number;
  totalAmount: number;

  notes?: string;
  terms?: string;

  paymentInfo?: IPayment;

  isDeleted: boolean;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    logoURL: String,
    stampURL: String,
    signURL: String,
    gstNumber: String,
    ownerName: String,
    ownerDesignation: String,
    defaultTax: { type: Number, default: 18 },
  },
  { _id: false },
);

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    gstNumber: String,
  },
  { _id: false },
);

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const PaymentSchema = new Schema<IPayment>(
  {
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "upi", "card"],
      default: "cash",
    },

    paymentDetails: {
      bankName: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 SNAPSHOT DATA
    business: {
      type: BusinessSchema,
      required: true,
    },

    client: {
      type: ClientSchema,
      required: true,
    },

    // 🔹 META
    invoiceNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },

    issueDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },

    // 🔹 ITEMS
    items: {
      type: [ItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, "At least one item required"],
    },

    // 🔹 CALCULATIONS (STRICT)
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔹 EXTRA
    notes: {
      type: String,
      maxlength: 1000,
    },

    terms: {
      type: String,
      maxlength: 1000,
    },

    // 🔹 PAYMENT
    paymentInfo: {
      type: PaymentSchema,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

//  indexes

InvoiceSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
InvoiceSchema.index({ userId: 1, isDeleted: 1, status: 1 });
InvoiceSchema.index({ userId: 1, isDeleted: 1, dueDate: 1 });

InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

InvoiceSchema.index(
  {
    invoiceNumber: "text",
    "client.name": "text",
    "business.name": "text",
    "items.name": "text",
    "client.email": "text",
  },
  {
    weights: {
      invoiceNumber: 10,
      "client.name": 5,
      "business.name": 3,
      "items.name": 2,
      "client.email": 2,
    },
    name: "InvoiceTextSearch",
  },
);

export const Invoice = model("Invoice", InvoiceSchema);
