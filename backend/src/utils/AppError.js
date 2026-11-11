export default class AppError extends Error {
    constructor(message, statusCode = 400, errors = undefined) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
