const crypto = require("crypto");

/**
 * Middleware to ensure every incoming HTTP request has a unique Correlation ID.
 * Captures client-provided X-Correlation-ID or generates a new one (corr_<uuid>).
 */
function correlationMiddleware(req, res, next) {
  const correlationId =
    req.headers["x-correlation-id"] ||
    req.headers["x-request-id"] ||
    `corr_${crypto.randomUUID()}`;

  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  // Contextual gateway log
  console.log(`[${correlationId}] [Gateway] ${req.method} ${req.originalUrl}`);

  next();
}

module.exports = correlationMiddleware;
