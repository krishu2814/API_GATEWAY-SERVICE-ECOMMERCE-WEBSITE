const express = require('express');

const GatewayController = require('../controller/gateway-controller');

const { AUTH_SERVICE_URL } = require('../config/serverConfig');

const router = express.Router();

const gatewayController = new GatewayController();

router.use('/auth', (req, res) =>
    gatewayController.routeRequest(req, res, AUTH_SERVICE_URL)
);

module.exports = router;
