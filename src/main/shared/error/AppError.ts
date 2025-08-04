export class AppError extends Error { 
    constructor(
        message?: string,
        private _http_status_code: number = 400,
    ) {
        super(message);
        this.name = "AppError";
        this._http_status_code = _http_status_code;
    }

    get http_status_code() {
        return this._http_status_code;
    }
}

export default AppError;
