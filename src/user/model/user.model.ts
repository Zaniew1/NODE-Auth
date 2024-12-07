import mongoose from "mongoose";
import { comparePasswords, hashPassword } from "../../utils/helpers/PasswordManage";
import { HttpErrors } from "../../utils/constants/http";
import { Message } from "../../utils/constants/messages";
import appAssert from "../../utils/helpers/appAssert";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<UserDocument, "_id" | "email" | "verified" | "createdAt" | "updatedAt">;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hasshedPass = await hashPassword(this.password);
  appAssert(hasshedPass, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_INTERNAL_SERVER_ERROR);
  this.password = hasshedPass;
  return next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return comparePasswords(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
