import { z } from "zod";

// What the model may pass to the saveLead tool. The values come from a visitor
// via the model, so they're bounded and the email must actually be an email.
export const leadInputSchema = z.object({
  name: z.string().trim().min(1).max(100).describe("The visitor's name"),
  email: z.email().max(254).describe("The visitor's email address"),
  whatTheyWantToBuild: z
    .string()
    .trim()
    .min(1)
    .max(1_000)
    .describe("A short summary of what the visitor wants to build or discuss"),
  notes: z.string().trim().max(2_000).optional().describe("Any other relevant context from the conversation"),
});

// The name ends up in an email subject, so strip anything that could break a header line.
export function leadSubject(name: string): string {
  const safeName = name.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim();
  return `New lead from the site bot: ${safeName}`;
}
