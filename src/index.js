const express = require('express');
const app = express();

const { PORT } = require('./config/serverConfig');

const setUpAndStartServer = async () => {
    app.use(express.json());

    app.use('/api/v1', require('./routes/gateway-route'));

    app.listen(PORT, () => {
        console.log(`API Gateway Service is running on port ${PORT}`);
    });
}

setUpAndStartServer();
