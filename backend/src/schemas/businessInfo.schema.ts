import { z } from "zod";

export const businessInfoSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoURL: z.string().url().optional(),
  stampURL: z.string().url().optional(),
  signURL: z.string().url().optional(),
  gstNumber: z.string().optional(),
  ownerName: z.string().optional(),
  ownerDesignation: z.string().optional(),
  defaultTax: z.number().default(18),
});

export type BusinessInfoReq = z.infer<typeof businessInfoSchema>;
