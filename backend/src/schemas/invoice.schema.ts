import { z } from "zod";

export const invoiceSchema = z.object({});

export type InvoiceSchemaReq = z.infer<typeof invoiceSchema>;
