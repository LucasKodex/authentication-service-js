import bodyParser from "body-parser";
import { Request, Response, Router } from "express";
import { SignUpController } from "./controller/SignUpController";
import { defaultErrorHandler } from "../middlewares/default-error-handler";

export const router = Router();

function placeholderHandler(req: Request, res: Response) { res.send({ todo: "TODO" }) }

const signUpController = new SignUpController();

router.use(bodyParser.json());
router.post("/signup", signUpController.handle, defaultErrorHandler);
router.post("/login", placeholderHandler, defaultErrorHandler);
router.post("/exchange-refresh-token", placeholderHandler, defaultErrorHandler);
router.post("/revoke-refresh-token", placeholderHandler, defaultErrorHandler);
