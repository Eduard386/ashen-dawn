import type { Config } from 'jest';

const config: Config = {
  // Basic Jest configuration
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Root directories
  roots: ['<rootDir>/src'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Ignore setup and utility files
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setupTests.ts',
    '<rootDir>/src/__tests__/utils/'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/typescript/core/$1',
    '^@scenes/(.*)$': '<rootDir>/src/typescript/scenes/$1',
    '^@types/(.*)$': '<rootDir>/src/typescript/types/$1',
    // Handle .js imports in TypeScript files
    '^(.+)\\.js$': '$1'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setupTests.ts'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'html'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/typescript/**/*.ts',
    '!src/typescript/**/*.d.ts',
    '!src/typescript/types/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  
  // Mock configuration for Phaser and Canvas
  setupFiles: [
    'jest-canvas-mock'
  ],
  
  // Global mocks
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
        moduleResolution: 'node'
      }
    }
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(phaser)/)'
  ]
};

export default config;
