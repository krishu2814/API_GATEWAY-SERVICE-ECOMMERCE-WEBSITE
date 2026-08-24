const express = require("express");
const GatewayController = require("../controller/gateway-controller");
const {
  AUTH_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  CART_SERVICE_URL,
  PAYMENT_SERVICE_URL,
  ORDER_SERVICE_URL,
  INVENTORY_SERVICE_URL,
  NOTIFICATION_SERVICE_URL,
} = require("../config/serverConfig");
const Authentication = require("../middleware/url-middleware");
const {
  authRateLimiter,
  orderRateLimiter,
  generalRateLimiter,
} = require("../middleware/rate-limiter");

const router = express.Router();
const gatewayController = new GatewayController();

/**
 * 1. Auth routes - Strict 15 req/min rate limit against brute-force
 */
router.use("/auth", authRateLimiter, (req, res) =>
  gatewayController.routeRequest(req, res, AUTH_SERVICE_URL),
);

/**
 * 2. Product routes:
 * - Rate limited by generalRateLimiter (100 req/min)
 * - GET requests are public for browsing & searching
 * - POST / PATCH / DELETE require Authentication
 */
router.use(
  "/products",
  generalRateLimiter,
  (req, res, next) => {
    if (req.method === "GET") {
      return next();
    }
    return Authentication(req, res, next);
  },
  (req, res) => gatewayController.routeRequest(req, res, PRODUCT_SERVICE_URL),
);

/**
 * 3. Protected routes - Authentication and Tiered Rate Limiting required
 */

// Cart routes (100 req/min)
router.use("/cart", generalRateLimiter, Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, CART_SERVICE_URL),
);

// Order routes (30 req/min)
router.use("/orders", orderRateLimiter, Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, ORDER_SERVICE_URL),
);

// Payment routes (30 req/min)
router.use("/payment", orderRateLimiter, Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, PAYMENT_SERVICE_URL),
);

// Inventory routes (100 req/min)
router.use("/inventory", generalRateLimiter, Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, INVENTORY_SERVICE_URL, "/inventory"),
);

// Notification routes (100 req/min)
router.use("/notifications", generalRateLimiter, Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, NOTIFICATION_SERVICE_URL),
);

module.exports = router;
