#!/usr/bin/env node

/**
 * Simple production start script for AutoNews.AI
 * Alternative to deploy.js for quick production startup
 */

const fs = require('fs');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting AutoNews.AI in production mode...');

// Check if build exists
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Production build not found. Please run "npm run build" first.');
  console.log('💡 Tip: Use "node deploy.js" for automatic building and deployment.');
  process.exit(1);
}

// Start the production server
try {
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Failed to start production server:', error.message);
  process.exit(1);
}