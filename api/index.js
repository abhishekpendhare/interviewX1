const app = require('../server/index');

module.exports = (req, res) => {
    // If Vercel rewrites stripped '/api', prefix it back so Express mounts /api correctly
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
};
