import { passwordSchema } from "./loginSchema";
import verificationSchema from "./verificationSchema";
import z from "zod";
const changePassSchema = z.object({
  verificationCode: verificationSchema,
  password: passwordSchema,
});
export default changePassSchema;
