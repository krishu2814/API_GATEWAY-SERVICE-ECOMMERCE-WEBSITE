const UrlService = require("../service/url-service");

class GatewayController {
  constructor() {
    this.urlService = new UrlService();
  }

  async routeRequest(req, res, serviceUrl, prefix = "") {
    try {
      const response = await this.urlService.forwardRequest(
        req,
        serviceUrl,
        prefix,
      );

      // Forward downstream custom headers (e.g. X-Cache, X-Correlation-ID)
      if (response.headers) {
        if (response.headers["x-cache"]) {
          res.setHeader("X-Cache", response.headers["x-cache"]);
        }
        if (response.headers["x-correlation-id"]) {
          res.setHeader("X-Correlation-ID", response.headers["x-correlation-id"]);
        }
      }

      if (req.correlationId) {
        res.setHeader("X-Correlation-ID", req.correlationId);
      }

      return res.status(response.status).json(response.data);
    } catch (error) {
      if (req.correlationId) {
        res.setHeader("X-Correlation-ID", req.correlationId);
      }
      if (error.response?.headers?.["x-cache"]) {
        res.setHeader("X-Cache", error.response.headers["x-cache"]);
      }
      const status = error.response?.status || (error.code === "ECONNREFUSED" ? 503 : 502);
      const message = error.response?.data?.message || error.message || "API Gateway routing failure";
      return res.status(status).json(
        error.response?.data || {
          success: false,
          message,
          errorCode: error.code || "GATEWAY_ROUTING_ERROR",
          error: message,
          err: message,
          data: {},
        },
      );
    }
  }
}

module.exports = GatewayController;
