"use strict";
/**
 * MAIN APPLICATION ENTRY POINT - AprendaInglesGratis
 *
 * Express server with all middleware, routes, and error handling
 *
 * @module App
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = __importDefault(require("./config"));
// Initialize Express app
const app = (0, express_1.default)();
// ==================== MIDDLEWARE ====================
// Security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
// CORS
app.use((0, cors_1.default)({
    origin: config_1.default.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Global rate limiting
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config_1.default.rateLimit.api,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);
// ==================== HEALTH CHECK ====================
app.get('/health', async (_req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.default.env,
        version: '1.0.0',
    };
    res.status(200).json(health);
});
// ==================== API ROUTES ====================
const routes_1 = __importDefault(require("./routes"));
// API v1 routes - connect to real implementations
app.use('/api/v1', routes_1.default);
// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: err.name || 'Error',
        message,
        ...(config_1.default.env === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString(),
    });
});
// ==================== SERVER START ====================
const PORT = config_1.default.port;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀  AprendaInglesGratis API - Version 1.0.0           ║
║                                                            ║
║     Environment: ${config_1.default.env.padEnd(42)} ║
║     Port:        ${PORT.toString().padEnd(42)} ║
║     URL:         ${config_1.default.appUrl.padEnd(42)} ║
║                                                            ║
║     Status:      ✅ Server is running                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📚 API Documentation: ${config_1.default.appUrl}/api/docs
🏥 Health Check: ${config_1.default.appUrl}/health
  `);
    // Validate critical services
    console.log('\n🔍 Checking services...\n');
    if (!config_1.default.openai.apiKey) {
        console.warn('⚠️  OpenAI API key not configured - AI features will be disabled');
    }
    else {
        console.log('✅ OpenAI configured');
    }
    if (!config_1.default.redis.host || config_1.default.redis.host === 'localhost') {
        console.warn('⚠️  Redis not configured - Caching will use in-memory fallback');
    }
    else {
        console.log('✅ Redis configured');
    }
    if (!config_1.default.stripe.secretKey) {
        console.warn('⚠️  Stripe not configured - Payments will be disabled');
    }
    else {
        console.log('✅ Stripe configured');
    }
    console.log('\n✨ Ready to accept connections!\n');
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map