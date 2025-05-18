import { Router } from "express";
import { router as swaggerui } from "./swaggerui";
import { router as authentication } from "./auth";

export const router = Router();

router.use("/api-docs", swaggerui);
router.use("/", authentication);
