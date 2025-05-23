import dotenv from "dotenv-safe";
import { app } from "./app";

dotenv.config();

const port: number = Number.parseInt(process.env.SERVER_PORT ?? "80");
const hostname: string = process.env.SERVER_HOSTNAME ?? "localhost";

app.listen(port, hostname, function () {
    console.log(`Listening on http://${hostname}:${port}/`);
});