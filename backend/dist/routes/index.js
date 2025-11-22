"use strict";
/**
 * API Routes - AprendaInglesGratis
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const speaking_routes_1 = __importDefault(require("./speaking.routes"));
const listening_routes_1 = __importDefault(require("./listening.routes"));
const placement_routes_1 = __importDefault(require("./placement.routes"));
const gamification_routes_1 = __importDefault(require("./gamification.routes"));
const grammar_routes_1 = __importDefault(require("./grammar.routes"));
const teachers_routes_1 = __importDefault(require("./teachers.routes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
router.use('/auth', auth_routes_1.default);
router.use('/speaking', speaking_routes_1.default);
router.use('/listening', listening_routes_1.default);
router.use('/placement', placement_routes_1.default);
router.use('/gamification', gamification_routes_1.default);
router.use('/grammar', grammar_routes_1.default);
router.use('/teachers', teachers_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map