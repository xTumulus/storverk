import { z } from "zod";

export const credentialEntrySchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().url().optional(),
});
export const credentialsSchema = z.array(credentialEntrySchema);

export type CredentialEntry = z.infer<typeof credentialEntrySchema>;
