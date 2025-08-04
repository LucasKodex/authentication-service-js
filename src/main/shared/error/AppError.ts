export interface AppErrorParams {
    http_status_code?: number;
}

export class AppError extends Error { 
    private _http_status_code: number;

    constructor(
        message?: string,
        app_error_params?: AppErrorParams,
    ) {
        super(message);
        this.name = AppError.name;
        const BAD_REQUEST = 400;
        this._http_status_code = app_error_params?.http_status_code ?? BAD_REQUEST;
    }

    get http_status_code() {
        return this._http_status_code;
    }
}

export default AppError;
