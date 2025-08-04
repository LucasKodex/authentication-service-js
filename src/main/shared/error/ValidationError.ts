import AppError, { AppErrorParams } from "./AppError";

export class ValidationError extends AppError {
    constructor(
        message?: string,
        app_error_params?: AppErrorParams,
    ) {
        super(message, app_error_params);
        this.name = ValidationError.name;
    }
}

export default ValidationError;
