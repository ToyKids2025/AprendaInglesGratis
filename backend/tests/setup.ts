/**
 * Test Setup
 * Configuração global para todos os testes
 */

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-min-32-chars'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only-min-32-chars'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/englishflow_test?schema=public'
process.env.OPENAI_API_KEY = 'sk-test-key-for-testing'

// Global test timeout
jest.setTimeout(30000)

// Mock console methods to reduce test output noise (optional)
global.console = {
  ...console,
  log: jest.fn(), // Silence console.log in tests
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
}
