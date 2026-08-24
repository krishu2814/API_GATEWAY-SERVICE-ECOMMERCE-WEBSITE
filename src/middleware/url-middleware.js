const JWT = require('jsonwebtoken');
const { SECRET_TOKEN } = require('../config/serverConfig');

const Authentication = (req, res, next) => {
    try {
        // Strip any client-supplied x-user-* headers to prevent header spoofing
        delete req.headers['x-user-id'];
        delete req.headers['x-user-role'];
        delete req.headers['x-user-email'];

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header is missing or invalid'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing'
            });
        }

        const decoded = JWT.verify(token, SECRET_TOKEN);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Attach decoded user claims ({ id, email, role })
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = Authentication;
