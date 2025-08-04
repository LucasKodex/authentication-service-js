import AppError, { AppErrorParams } from "./AppError";

export class UniqueConstraintError extends AppError {
    constructor(
        message?: string,
        app_error_params?: AppErrorParams,
    ) {
        super(message, app_error_params);
        this.name = UniqueConstraintError.name;
    }
}

export default UniqueConstraintError;
