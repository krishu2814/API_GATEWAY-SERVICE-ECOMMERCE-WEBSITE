require("dotenv").config();

const requiredEnvVars = [
  "AUTH_SERVICE_URL",
  "PRODUCT_SERVICE_URL",
  "CART_SERVICE_URL",
  "ORDER_SERVICE_URL",
  "PAYMENT_SERVICE_URL",
  "INVENTORY_SERVICE_URL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing in .env`);
  }
});

module.exports = {
  PORT: process.env.PORT || 5014,
  SECRET_TOKEN: process.env.SECRET_TOKEN || "krishukumar@2814",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
  CART_SERVICE_URL: process.env.CART_SERVICE_URL,
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL,
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL,
  INVENTORY_SERVICE_URL:
    process.env.INVENTORY_SERVICE_URL || "http://localhost:5016",
};
