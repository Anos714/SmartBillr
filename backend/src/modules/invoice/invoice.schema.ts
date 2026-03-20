import * as z from "zod";

export const itemSchema = z.object({
  description: z.string().min(1, "Invoice description is required"),
  quantity: z.number().min(1, "Quantity is required").default(1),
  unitPrice: z.number().min(1, "Unit Price is required").default(0),
});
