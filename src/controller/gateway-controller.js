const UrlService = require('../service/url-service');

class GatewayController {
    constructor() {
        this.urlService = new UrlService();
    }

    async routeRequest(req, res, serviceUrl) {
        try {
            const response = await this.urlService.forwardRequest(req,serviceUrl);
            return res.status(response.status).json(response.data);
        } catch (error) {
            return res.status(error.response?.status || 500)
                .json(error.response?.data || {
                    success: false,
                    message: 'API Gateway Error'
                }
            );
        }
    }

}

module.exports = GatewayController;
