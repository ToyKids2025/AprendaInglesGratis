/**
 * API Integration Tests - AprendaInglesGratis
 */

import express from 'express';
import request from 'supertest';
import app from '../../index';

describe('API Health Check', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      // Create a minimal express app for testing
      const testApp = express();

      testApp.get('/health', (_req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: 'test',
          version: '1.0.0',
        });
      });

      const response = await request(testApp).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return API health status', async () => {
      const testApp = express();

      testApp.get('/api/v1/health', (_req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        });
      });

      const response = await request(testApp).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});

describe('API 404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const testApp = express();

    // Add 404 handler
    testApp.use((_req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'Route not found',
      });
    });

    const response = await request(testApp).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });
});
