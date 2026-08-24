const axios = require('axios');

class UrlService {

    async forwardRequest(req, serviceUrl) {
        try {
            // console.log(`Forwarding ${req.method} request to ${serviceUrl} and URL:${req.url}`);
            const targetUrl = `${serviceUrl}/api/v1${req.url}`;
            // console.log('Forwarding request to:', targetUrl);
            const response = await axios({
                method: req.method,
                url: targetUrl,
                params: req.query,
                data: req.body,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization || '',
                    'x-user-id': req.user?.id || req.user?._id || '',
                    'x-user-role': req.user?.role || '',
                    'x-user-email': req.user?.email || ''
                },
            });
            // console.log('Received response from service:', response.status);
            return response;
        }
        catch (error) {
            // console.error('Error forwarding request:', error.message);
            if(error.response) {
                // console.log(error.response.status);
                // console.log(error.response.data);
            }
            throw error;
        }

    }
}

module.exports = UrlService;
