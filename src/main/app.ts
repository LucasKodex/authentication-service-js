import { Application } from "express";
import express from "express";
import dotenv from "dotenv-safe";
import { router } from "./router";

dotenv.config();

export const app: Application = express();

app.use(router);
