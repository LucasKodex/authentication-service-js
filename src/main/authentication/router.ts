import bodyParser from "body-parser";
import { Request, Response, Router } from "express";
import { SignupController } from "./controller/SignupController";
import { DefaultErrorHandler } from "../middlewares/DefaultErrorHandler";

export class AuthenticationRouter {
    private _router: Router;

    constructor() {
        this._router = Router();

        function placeholderHandler(req: Request, res: Response) { res.send({ todo: "TODO" }) }

        const signup_controller = new SignupController();

        this._router.use(bodyParser.json());
        this._router.post("/signup",
            signup_controller.handle.bind(signup_controller),
        );
        this._router.post("/login", placeholderHandler);
        this._router.post("/exchange-refresh-token", placeholderHandler);
        this._router.post("/revoke-refresh-token", placeholderHandler);

        const default_error_handler = new DefaultErrorHandler();
        this._router.use(default_error_handler.handle.bind(default_error_handler));
    };

    get router() {
        return this._router;
    }
}

export default AuthenticationRouter;
