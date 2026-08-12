import { z } from "zod";

export const siteConfigSchema = z.object({
  site: z.object({
    name: z.string(),
    domain: z.string().url(),
    description: z.string(),
    defaultOgImage: z.string(),
  }),
  theme: z.object({
    daisyTheme: z.string(),
  }),
  security: z.object({
    hsts: z.object({
      enabled: z.boolean(),
      maxAgeSeconds: z.number().int().positive(),
      includeSubDomains: z.boolean(),
    }),
  }),
  llm: z.object({
    enabled: z.boolean(),
  }),
  support: z.object({
    platforms: z.array(
      z.object({
        type: z.enum(["buymeacoffee", "patreon", "kofi", "githubsponsors"]),
        url: z.string().url(),
      }),
    ),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
