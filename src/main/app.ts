import { Application } from "express";
import express from "express";
import dotenv from "dotenv-safe";
import { CoreRouter } from "./router";

dotenv.config();

export class App {
    private _app: Application;
    
    constructor() {
        this._app = express();
        this._app.use(new CoreRouter().router);
    }

    get app(): Application {
        return this._app;
    }
}

export default App;
