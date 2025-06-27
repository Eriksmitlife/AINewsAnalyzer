#!/usr/bin/env node

/**
 * Production start script for AutoNews.AI
 * Complies with Replit security requirements for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force production environment - security requirement
process.env.NODE_ENV = 'production';

console.log('AutoNews.AI Production Server Starting...');
console.log('Environment: PRODUCTION');

// Security validation - must be in production mode
if (process.env.NODE_ENV !== 'production') {
  console.error('SECURITY ERROR: Development mode blocked in production');
  console.error('Current NODE_ENV:', process.env.NODE_ENV);
  process.exit(1);
}

// Validate production build exists
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');

if (!fs.existsSync(indexPath)) {
  console.error('DEPLOYMENT ERROR: Production build not found');
  console.error('Required: dist/index.js');
  console.log('Solution: Run "node deploy.js" for automatic building');
  process.exit(1);
}

console.log('Build Validation: Production artifacts found');
console.log('Security: Production mode enforced');

// Start the production server
try {
  console.log('Starting production server...');
  const { default: startServer } = await import('./dist/index.js');
} catch (error) {
  console.error('STARTUP ERROR:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});