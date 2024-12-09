import { PORT, NODE_ENV } from "../utils/constants/env";
import { Express } from "express";
import { connectToDatabase } from "./db";

export const startServer = async (application: Express) => {
  if (process.env.NODE_ENV == "dev" || process.env.NODE_ENV == "prod") {
    application.listen(PORT, async () => {
      console.log("Server running on port: " + PORT + " on " + NODE_ENV + " environment");
      await connectToDatabase();
    });
  }
};
