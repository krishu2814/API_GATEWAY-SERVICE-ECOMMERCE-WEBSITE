const express = require('express');
const app = express();

const { PORT } = require('./config/serverConfig');

const setUpAndStartServer = async () => {
    app.use(express.json());

    // Define routes for different services

    // 
    app.listen(PORT, () => {
        console.log(`API Gateway Service is running on port ${PORT}`);
    });
}

setUpAndStartServer();
