const { AppError } = require("../utils/errors/app-error");

/**
 * Global Error Handling Middleware for ApiGateway-Service
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Axios / Network / Downstream Errors
  if (err.isAxiosError || err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    const service = req.originalUrl.split("/")[3] || "microservice";
    error = new AppError(`Downstream ${service} service is unreachable or offline`, 503, "SERVICE_UNAVAILABLE");
  } else if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
    error = new AppError("Gateway timed out waiting for microservice response", 504, "GATEWAY_TIMEOUT");
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token", 401, "INVALID_TOKEN");
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Authentication token has expired", 401, "TOKEN_EXPIRED");
  }

  // Normalize to AppError
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || "INTERNAL_SERVER_ERROR";
  const message = error.message || "API Gateway routing error occurred";
  const details = error.details || null;

  if (statusCode >= 500) {
    console.error(`[API Gateway Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    error: message,
    err: message,
    data: details ? { details } : {},
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
