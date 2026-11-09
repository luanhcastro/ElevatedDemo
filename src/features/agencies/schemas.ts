import { z } from "zod";

export const agencySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
});
export type AgencyFormValues = z.infer<typeof agencySchema>;
