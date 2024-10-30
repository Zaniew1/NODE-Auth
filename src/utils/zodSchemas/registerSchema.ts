import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(3, "Name to short, 3 chars minimum")
      .max(50, "Name to long, 50 chars maximum"),
    surname: z.string().trim().min(2, "Surname to short, 2 chars minimum").max(50, "Surname to long, 50 chars maximum").optional(),
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Not a valid email")
      .min(5, "Email to short, 5 chars minimum")
      .max(50, "Email to long, 50 chars maximum"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .trim()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: "Password needs at least 8 chars, 1 number, 1 big letter and 1 special char",
      })
      .min(8, "Password to short, 8 chars minimum")
      .max(30, "Password to long, 30 chars maximum"),
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
