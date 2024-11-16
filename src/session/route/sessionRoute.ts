import express from "express";
import * as SessionController from "../controller/sessionController";
export const sessionRouter = express.Router();

sessionRouter.get("/", SessionController.getSessionHandler);
sessionRouter.delete("/", SessionController.deleteSessionHandler);

export default sessionRouter;
