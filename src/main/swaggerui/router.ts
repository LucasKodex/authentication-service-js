import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv-safe";
import { Router } from "express";
import { SwaggerUiService } from "./service";

dotenv.config();

const service = new SwaggerUiService();

export const router = Router();

const openapiSpecPath = process.env.OPENAPI_SPECIFICATION_FILE_PATH ?? "./openapi.yml";
const openapiSpec = service.getOpenApiSpec(openapiSpecPath); 

router.use("/", swaggerUi.serve, swaggerUi.setup(openapiSpec));
