const express = require("express");
const GatewayController = require("../controller/gateway-controller");
const {
  AUTH_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  CART_SERVICE_URL,
  PAYMENT_SERVICE_URL,
  ORDER_SERVICE_URL,
  INVENTORY_SERVICE_URL,
} = require("../config/serverConfig");
const Authentication = require("../middleware/url-middleware");

const router = express.Router();
const gatewayController = new GatewayController();

/**
 * Unprotected routes - No authentication required
 */
router.use("/auth", (req, res) =>
  gatewayController.routeRequest(req, res, AUTH_SERVICE_URL),
);

/**
 * Product routes:
 * - GET requests are public for browsing & searching
 * - POST / PATCH / DELETE require Authentication
 */
router.use(
  "/products",
  (req, res, next) => {
    if (req.method === "GET") {
      return next();
    }
    return Authentication(req, res, next);
  },
  (req, res) => gatewayController.routeRequest(req, res, PRODUCT_SERVICE_URL),
);

/**
 * Protected routes - Authentication required
 */

router.use("/cart", Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, CART_SERVICE_URL),
);

router.use("/orders", Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, ORDER_SERVICE_URL),
);

router.use("/payment", Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, PAYMENT_SERVICE_URL),
);

router.use("/inventory", Authentication, (req, res) =>
  gatewayController.routeRequest(req, res, INVENTORY_SERVICE_URL, "/inventory"),
);

router.use("/reservations", Authentication, (req, res) =>
  gatewayController.routeRequest(
    req,
    res,
    INVENTORY_SERVICE_URL,
    "/reservations",
  ),
);

module.exports = router;
