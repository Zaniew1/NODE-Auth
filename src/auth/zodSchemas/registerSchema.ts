import { z } from "zod";
import loginSchema from "./loginSchema";
export const registerSchema = loginSchema
  .extend({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(3, "Name to short, 3 chars minimum")
      .max(50, "Name to long, 50 chars maximum"),
    surname: z.string().trim().min(2, "Surname to short, 2 chars minimum").max(50, "Surname to long, 50 chars maximum").optional(),
    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .trim()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: "Password needs 8 chars minimum, 1 number, 1 big letter and 1 special char",
      })
      .min(8, "Confirmation password to short, 8 chars minimum")
      .max(30, "Confirmation password to long, 30 chars maximum"),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type newUserType = z.infer<typeof registerSchema>;
export type UserType = newUserType & {
  id: number;
  passwordResetToken: string;
  passwordResetExpires: string;
  verified: boolean;
  createdAt: Date;
  modifiedAt: Date;
  enterprises: [];
};
export default registerSchema;
