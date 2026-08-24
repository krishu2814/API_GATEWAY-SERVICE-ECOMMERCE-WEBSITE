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

      return res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response?.headers?.["x-cache"]) {
        res.setHeader("X-Cache", error.response.headers["x-cache"]);
      }
      return res.status(error.response?.status || 500).json(
        error.response?.data || {
          success: false,
          message: "API Gateway Error",
        },
      );
    }
  }
}

module.exports = GatewayController;
