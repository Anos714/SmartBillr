import { z } from "zod";

export const invoiceSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1, "Invoice number is required")
      .max(50)
      .regex(/^[A-Z0-9\-\/]+$/i, "Invalid invoice number format"),

    issueDate: z.coerce.date({
      message: "Issue date is required",
    }),

    dueDate: z.coerce.date({
      message: "Due date is required",
    }),

    status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),

    currency: z.string().trim().min(1).default("INR"),

    notes: z
      .string()
      .max(1000, "Notes cannot be greater than 1000 characters")
      .optional(),

    terms: z
      .string()
      .max(1000, "Terms cannot be greater than 1000 characters")
      .optional(),

    discount: z.number().min(0).default(0),

    business: z.object({
      name: z.string().trim().min(1, "Business name is required"),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      logoURL: z.string().url().optional(),
      stampURL: z.string().url().optional(),
      signURL: z.string().url().optional(),
      gstNumber: z.string().optional(),
      ownerName: z.string().optional(),
      ownerDesignation: z.string().optional(),
    }),

    client: z.object({
      name: z.string().trim().min(1, "Client name is required"),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      gstNumber: z.string().optional(),
    }),

    items: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Item name is required"),
          description: z.string().optional(),
          quantity: z.number().min(1),
          price: z.number().min(0),
          tax: z.number().min(0).default(0),
        }),
      )
      .min(1, "At least one item is required"),

    paymentInfo: z
      .object({
        paymentMethod: z.enum(["cash", "bank", "upi", "card"]).default("cash"),

        paymentDetails: z
          .object({
            bankName: z.string().optional(),
            accountNumber: z.string().optional(),
            ifsc: z.string().optional(),
            upiId: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "Due date cannot be before issue date",
    path: ["dueDate"],
  });

export type InvoiceSchemaReq = z.infer<typeof invoiceSchema>;

export const updateInvoiceSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9\-\/]+$/i)
      .optional(),

    issueDate: z.coerce.date().optional(),

    dueDate: z.coerce.date().optional(),

    status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),

    currency: z.string().trim().min(1).optional(),

    notes: z.string().max(1000).optional(),

    terms: z.string().max(1000).optional(),

    discount: z.number().min(0).optional(),

    business: z
      .object({
        name: z.string().trim().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        logoURL: z.string().url().optional(),
        stampURL: z.string().url().optional(),
        signURL: z.string().url().optional(),
        gstNumber: z.string().optional(),
        ownerName: z.string().optional(),
        ownerDesignation: z.string().optional(),
      })
      .partial()
      .optional(),

    client: z
      .object({
        name: z.string().trim().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        gstNumber: z.string().optional(),
      })
      .partial()
      .optional(),

    items: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          description: z.string().optional(),
          quantity: z.number().min(1),
          price: z.number().min(0),
          tax: z.number().min(0).default(0),
        }),
      )
      .min(1)
      .optional(),

    paymentInfo: z
      .object({
        paymentMethod: z.enum(["cash", "bank", "upi", "card"]).optional(),

        paymentDetails: z
          .object({
            bankName: z.string().optional(),
            accountNumber: z.string().optional(),
            ifsc: z.string().optional(),
            upiId: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.issueDate && data.dueDate) {
        return data.dueDate >= data.issueDate;
      }
      return true;
    },
    {
      message: "Due date cannot be before issue date",
      path: ["dueDate"],
    },
  );

export type UpdateInvoiceReq = z.infer<typeof updateInvoiceSchema>;
