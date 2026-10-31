require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');
const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 3000;
const app = express();
app.disable('x-powered-by');

const allowedOrigins = new Set(
    (process.env.CORS_ALLOWED_ORIGINS || `http://localhost:${PORT}`)
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
);

// 1. Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https: http:; worker-src 'self' blob:; frame-ancestors 'none';");
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// 2. Sensitive File & Direct Code Leaks Guard (Always 404)
const FORBIDDEN_FILE_PATTERNS = [
    /^\/\.env/i,
    /^\/server(\/.*)?$/i,
    /^\/client(\/src|\/node_modules|\/public)?(\/.*)?$/i,
    /^\/node_modules(\/.*)?$/i,
    /^\/\.git(\/.*)?$/i,
    /^\/package\.json$/i,
    /^\/package-lock\.json$/i,
    /^\/CLAUDE\.md$/i,
    /^\/ARCHITECTURE\.md$/i,
    /^\/.*\.md$/i,
    /^\/.*\.map$/i,
    /^\/.*store\.json$/i,
    /^\/.*\.json$/i,
    /^\/.*\.ts$/i,
    /^\/.*\.tsx$/i,
];

app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && FORBIDDEN_FILE_PATTERNS.some(pat => pat.test(req.path))) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return res.status(404).type('text/plain').send('Not Found');
    }
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) return callback(null, true);
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// 3. API Rate Limiter
const API_RATE_LIMITS = new Map();
app.use('/api', (req, res, next) => {
    if (req.path === '/status' || req.path === '/public/home-stats') return next();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let window = API_RATE_LIMITS.get(key);
    if (!window || now >= window.resetAt) {
        if (API_RATE_LIMITS.size > 5000) {
            for (const [ip, current] of API_RATE_LIMITS.entries()) {
                if (now >= current.resetAt) API_RATE_LIMITS.delete(ip);
            }
        }
        window = { count: 0, resetAt: now + 15 * 60 * 1000 };
        API_RATE_LIMITS.set(key, window);
    }
    if (window.count >= 600) {
        res.setHeader('Retry-After', String(Math.max(1, Math.ceil((window.resetAt - now) / 1000))));
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    window.count += 1;
    return next();
});

// 4. API Routes
app.use('/api', apiRoutes);

// 5. Dedicated Public SEO Files
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(
`User-agent: *
Allow: /
Allow: /login
Allow: /signup
Allow: /forgot-password
Allow: /reset-password
Allow: /terms
Allow: /privacy
Allow: /honor-code
Disallow: /api/
Disallow: /compiler
Disallow: /foundations
Disallow: /simulator
Disallow: /advisor
Disallow: /dossier
Disallow: /articles
Disallow: /planner
Disallow: /analytics
Disallow: /app/

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
`
    );
});

app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const host = `${req.protocol}://${req.get('host')}`;
    res.send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${host}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${host}/login</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${host}/signup</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${host}/forgot-password</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${host}/reset-password</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${host}/terms</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${host}/privacy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${host}/honor-code</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`
    );
});

// 6. Client Dist Static Hosting (strictly dist/ only)
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
    console.log(`📦 Serving STRATA Production SPA from ${clientDistPath}`);
    app.use(express.static(clientDistPath, {
        index: false,
        dotfiles: 'ignore',
        fallthrough: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}

// 7. Missing Static Asset Guard (Assets not found return 404, never redirect to login)
app.use((req, res, next) => {
    if (req.path.startsWith('/assets/') || /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.path)) {
        return res.status(404).type('text/plain').send('Asset Not Found');
    }
    next();
});

// 8. Public vs Protected Page Routing
const PUBLIC_PAGE_ROUTES = new Set([
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/honor-code',
    '/compiler'
]);

const AUTH_FLOW_PAGES = new Set([
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
]);

function getSessionUser(req) {
    const token = req.cookies && req.cookies.session_token;
    if (!token) return null;
    const session = db.getSession(token);
    if (!session || !session.userId) return null;
    const user = db.getStudentById(session.userId);
    return user || { id: session.userId };
}

function sanitizeNextParam(nextUrl, fallback = '/foundations') {
    if (!nextUrl || typeof nextUrl !== 'string') return fallback;
    const trimmed = nextUrl.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
        return fallback;
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
        return fallback;
    }
    try {
        const parsed = new URL(trimmed, 'http://localhost');
        if (parsed.origin !== 'http://localhost') return fallback;
        return parsed.pathname + parsed.search + parsed.hash;
    } catch {
        return fallback;
    }
}

app.use((req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const user = getSessionUser(req);
    const reqPath = req.path.replace(/\/+$/, '') || '/';
    const isPublicPage = PUBLIC_PAGE_ROUTES.has(reqPath);
    const isAuthFlowPage = AUTH_FLOW_PAGES.has(reqPath);

    // 1. If logged in and visits auth flow pages -> redirect to dashboard
    if (user && isAuthFlowPage) {
        const nextParam = req.query.next || req.query.redirect;
        const target = sanitizeNextParam(nextParam, '/foundations');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return res.redirect(302, target);
    }

    // 2. If public page -> serve index.html with 200 OK
    if (isPublicPage) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.sendFile(path.join(clientDistPath, 'index.html'));
    }

    // 3. For any other page:
    // If NOT logged in -> REDIRECT to /login?next=<requested path> (302, NO protected content in body)
    if (!user) {
        const originalPath = req.originalUrl || req.url;
        const safeNext = sanitizeNextParam(originalPath, '/');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return res.redirect(302, `/login?next=${encodeURIComponent(safeNext)}`);
    }

    // 4. If logged in -> serve index.html with noindex and no-store
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.sendFile(path.join(clientDistPath, 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`⚡ STRATA // Autonomous Placement Engineering Platform`);
        console.log(`👉 http://localhost:${PORT}`);
        console.log(`=======================================================`);
    });
}

module.exports = app;
