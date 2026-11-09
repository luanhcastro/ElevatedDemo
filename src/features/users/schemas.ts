import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
});
export const createUserSchema = baseUserSchema.extend({ password: z.string().min(8, "Password must be at least 8 characters.").max(72, "Password must be 72 characters or fewer.") });
export const updateUserSchema = baseUserSchema;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
