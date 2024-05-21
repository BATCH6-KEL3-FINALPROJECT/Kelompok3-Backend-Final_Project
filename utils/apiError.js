class apiError extends Error {
    constructor(message, statusCode) {
        super(message)

        console.log(message)
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "Failed" : "Error";

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = apiError;