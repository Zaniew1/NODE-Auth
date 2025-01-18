import z from "zod";
import mongoose from "mongoose";
import { Message } from "../../utils/constants/messages";
export const objectIdSchema = z
  .string()
  .refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: Message.FAIL_WRONG_SESSIONID_OR_USERID,
  })
  .transform((_id) => new mongoose.Types.ObjectId(_id));
