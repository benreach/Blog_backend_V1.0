class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // mark known operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
