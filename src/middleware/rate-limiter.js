const { getRedisClient } = require("../config/redis");

/**
 * Creates a configurable distributed sliding-window rate limiter middleware using Redis.
 *
 * @param {Object} options
 * @param {number} options.limit - Maximum number of requests allowed within the time window
 * @param {number} options.windowSeconds - Window duration in seconds (e.g. 60 for 1 minute)
 * @param {string} options.prefix - Redis key namespace (e.g. "rl:auth", "rl:orders")
 * @param {string} [options.message] - Custom error message for HTTP 429 response
 * @returns {Function} Express middleware function
 */
function createRateLimiter(options) {
  const {
    limit = 100,
    windowSeconds = 60,
    prefix = "rl:general",
    message = "Too many requests. Please try again later.",
  } = options;

  return async function rateLimiterMiddleware(req, res, next) {
    try {
      const redis = getRedisClient();

      // Extract client identifier: authenticated User ID or client IP
      const clientIdentifier =
        (req.user && (req.user.id || req.user.userId || req.user.email)) ||
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "anonymous";

      const key = `${prefix}:${clientIdentifier}`;

      // Atomic sliding window pipeline execution
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);

      const results = await pipeline.exec();

      // results[0] = [err, currentCount], results[1] = [err, ttl]
      const currentCount = results[0][1];
      let ttl = results[1][1];

      // If key is brand new, set expiration
      if (currentCount === 1 || ttl === -1) {
        await redis.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const resetTime = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);
      const remaining = Math.max(0, limit - currentCount);

      // Inject standard RFC RateLimit headers
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", resetTime);

      // Check quota
      if (currentCount > limit) {
        const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds;
        res.setHeader("Retry-After", retryAfterSeconds);

        console.warn(
          `[Rate Limit Exceeded] Client ${clientIdentifier} exceeded limit (${currentCount}/${limit}) on ${prefix}`,
        );

        return res.status(429).json({
          success: false,
          message: `${message} (Retry after ${retryAfterSeconds}s)`,
          error: "RATE_LIMIT_EXCEEDED",
          retryAfter: retryAfterSeconds,
        });
      }

      return next();
    } catch (error) {
      // Fail-open strategy: If Redis fails, allow request through with warning
      console.warn(
        `[Rate Limiter Warning] Redis rate limiting bypassed due to error: ${error.message}`,
      );
      return next();
    }
  };
}

module.exports = {
  createRateLimiter,
  // Pre-configured rate limiters
  authRateLimiter: createRateLimiter({
    limit: 15,
    windowSeconds: 60,
    prefix: "rl:auth",
    message: "Too many authentication requests.",
  }),
  orderRateLimiter: createRateLimiter({
    limit: 30,
    windowSeconds: 60,
    prefix: "rl:order",
    message: "Too many checkout or payment requests.",
  }),
  generalRateLimiter: createRateLimiter({
    limit: 100,
    windowSeconds: 60,
    prefix: "rl:general",
    message: "Request quota exceeded.",
  }),
};
