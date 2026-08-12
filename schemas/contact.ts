import { z } from "zod";

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;
