import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/authRoute";
import morgan from "morgan";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import { Request, Response } from "express";
import { OK } from "./utils/constants/http";
import { PORT, NODE_ENV, APP_VERSION, APP_ORIGIN } from "./utils/constants/env";
import { connectToDatabase } from "./config/db";
const app = express();

app.use(express.json());
app.use(morgan(NODE_ENV));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN ?? "*",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(`/api/${APP_VERSION}/auth`, authRouter);
app.get("/", (req: Request, res: Response) => {
  // throw new Error("Test error");
  res.status(OK).json({
    status: "good",
  });
});
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log("Server running on port: " + PORT + " on " + NODE_ENV + " environment");
  await connectToDatabase();
});

export default app;
