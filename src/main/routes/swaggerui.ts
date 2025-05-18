import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv-safe";
import fs from "node:fs";
import YAML from "yaml";
import { Router } from "express";

dotenv.config();

export const router = Router();

const openapiSpecPath = process.env.OPENAPI_SPECIFICATION_FILE_PATH ?? "./openapi.yml";
const file = fs.readFileSync(openapiSpecPath, "utf-8");
const openapiSpec = YAML.parse(file);

router.use("/", swaggerUi.serve, swaggerUi.setup(openapiSpec));
