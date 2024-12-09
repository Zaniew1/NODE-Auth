import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./auth/route/authRoute";
import { userRouter } from "./user/route/userRoute";
import { sessionRouter } from "./session/route/sessionRoute";
import morgan from "morgan";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import { NODE_ENV, APP_VERSION, APP_ORIGIN } from "./utils/constants/env";
import { startServer } from "./config/server";
import { authenticator } from "./middleware/authenticator";
const app = express();

app.use(express.json());
app.use(morgan(NODE_ENV));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
const apiPath = `/api/${APP_VERSION}`;
app.use(`${apiPath}/auth`, authRouter);
app.use(`${apiPath}/user`, authenticator, userRouter);
app.use(`${apiPath}/session`, authenticator, sessionRouter);

app.use(errorHandler);

startServer(app);

export default app;
