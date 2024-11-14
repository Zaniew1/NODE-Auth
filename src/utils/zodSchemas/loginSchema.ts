import { z } from "zod";

export const emailSchema = z
  .string({
    required_error: "Name is required",
  })
  .trim()
  .min(3, "Name to short, 3 chars minimum")
  .max(50, "Name to long, 50 chars maximum");
export const passwordSchema = z
  .string({
    required_error: "Password is required",
  })
  .trim()
  .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: "Password needs at least 8 chars, 1 number, 1 big letter and 1 special char",
  })
  .min(8, "Password to short, 8 chars minimum")
  .max(30, "Password to long, 30 chars maximum");

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type zodloginUserType = z.infer<typeof loginSchema>;

export type loginUserType = zodloginUserType & {
  userAgent?: string;
};

export default loginSchema;
