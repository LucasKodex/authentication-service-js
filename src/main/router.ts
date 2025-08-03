import { Router } from "express";
import { router as swaggerui } from "./swaggerui/router";
import { AuthenticationRouter } from "./authentication/router";

export class CoreRouter {
    private _router: Router;

    constructor() {
        this._router = Router();
        
        this._router.use("/api-docs", swaggerui);
        this._router.use("/", new AuthenticationRouter().router);
    }

    get router(): Router {
        return this._router;
    }
}

export default CoreRouter;
