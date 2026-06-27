import z from "zod";

const verificationSchema = z
  .string({ required_error: "Verification code is required" })
  .min(1, "Verification code is minimum 1 char")
  .max(36, "Verification code should have max 36 chars");

export default verificationSchema;
