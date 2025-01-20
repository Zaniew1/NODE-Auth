import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../../utils/helpers/date";
import { UserDocument } from "../../user/model/user.model";

export interface SessionDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: UserDocument["_id"];
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  userAgent: { type: String },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow(),
  },
});

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);
export default SessionModel;
