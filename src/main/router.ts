import { Router } from "express";
import { router as swaggerui } from "./swaggerui/router";
import { router as authentication } from "./authentication/router";

export const router = Router();

router.use("/api-docs", swaggerui);
router.use("/", authentication);
