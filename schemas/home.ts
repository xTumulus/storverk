import { z } from "zod";

export const heroButtonSchema = z.object({
  label: z.string(),
  to: z.string(),
  style: z.enum(["primary", "ghost"]).default("primary"),
});
export const homeSchema = z.object({
  name: z.string(),
  image: z.string().optional(),
  buttons: z.array(heroButtonSchema).default([]),
});

export type HeroButton = z.infer<typeof heroButtonSchema>;

export interface Home extends z.infer<typeof homeSchema> {
  bodyHtml: string;
}
