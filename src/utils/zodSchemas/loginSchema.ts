import { z } from "zod";
export const loginSchema = z.object({
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
});
export type loginUserType = z.infer<typeof loginSchema>;
export default loginSchema;
