import fs from "node:fs";
import YAML from "yaml";

export class SwaggerUiService {
    getOpenApiSpec(file_path: string): any {
        const file = fs.readFileSync(file_path, "utf-8");
        const isYAML = [".yml", ".yaml"].reduce(
            function (prev, curr) {
                return prev || file_path.endsWith(curr);
            }
        , false);
        if (isYAML) return YAML.parse(file);
        else return JSON.parse(file);
    }
}
