import express from "express";
import * as SessionController from "../controllers/sessionController";
export const sessionRouter = express.Router();

sessionRouter.get("/", SessionController.getSessionHandler);
sessionRouter.delete("/", SessionController.deleteSessionHandler);

export default sessionRouter;
