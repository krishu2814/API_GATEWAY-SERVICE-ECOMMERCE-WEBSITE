const dotenv = require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5015,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
    CART_SERVICE_URL: process.env.CART_SERVICE_URL,
    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL,
    PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL,
}
