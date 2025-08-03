import "reflect-metadata";
import dotenv from "dotenv-safe";
dotenv.config();

import { ContainerWrapper } from "./shared/container/index";
import { App } from "./app";

const port: number = Number.parseInt(process.env.SERVER_PORT ?? "80");
const hostname: string = process.env.SERVER_HOSTNAME ?? "localhost";

const container = new ContainerWrapper();
await container.initialize();
const app = new App().app;

app.listen(port, hostname, function () {
    console.log(`Listening on http://${hostname}:${port}/`);
});
