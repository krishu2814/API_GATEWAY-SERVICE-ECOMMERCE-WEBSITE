const express = require('express');
const app = express();

const { PORT } = require('./config/serverConfig');

const setUpAndStartServer = async () => {
    app.use(express.json());
    app.use(require('./middleware/correlation-middleware'));

    app.use('/api/v1', require('./routes/gateway-route'));

    // Error Handling Middleware
    app.use(require('./middleware/not-found-handler'));
    app.use(require('./middleware/error-handler'));

    app.listen(PORT, () => {
        console.log(`API Gateway Service is running on port ${PORT}`);
    });
}

setUpAndStartServer();
