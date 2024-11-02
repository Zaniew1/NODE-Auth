import mongoose from "mongoose";
import { MONGO_DB_PASS } from "../utils/constants/env";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_DB_PASS);
    console.log("Successfully connected to DB");
  } catch (error) {
    console.error("Could not connect to DB", error);
    process.exit(1);
  }
};
export default connectToDatabase;
