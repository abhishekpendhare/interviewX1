const serverless = require('serverless-http');
const app = require('../../server/index');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Normalize path so Express routing mounted at /api matches
    if (event.path.startsWith('/.netlify/functions/api')) {
        event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
    } else if (!event.path.startsWith('/api')) {
        event.path = '/api' + (event.path.startsWith('/') ? event.path : '/' + event.path);
    }
    return await handler(event, context);
};
