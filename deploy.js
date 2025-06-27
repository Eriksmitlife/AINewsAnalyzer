#!/usr/bin/env node

/**
 * Production deployment script for AutoNews.AI
 * This script ensures proper production environment setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 AutoNews.AI Deployment Script Starting...');

// Check if we're in a Replit environment
const isReplit = process.env.REPL_ID || process.env.REPLIT_DB_URL;
if (isReplit) {
  console.log('📦 Detected Replit environment');
}

// Function to run build if needed
function ensureBuild() {
  const distPath = path.join(__dirname, 'dist');
  const indexPath = path.join(distPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    console.log('🔨 Building application for production...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Build artifacts found');
  }
}

// Function to check environment variables
function checkEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  } else {
    console.log('✅ Environment variables verified');
  }
}

// Main deployment function
async function deploy() {
  try {
    console.log('🔍 Checking environment...');
    checkEnvironment();
    
    console.log('🔍 Ensuring build artifacts...');
    ensureBuild();
    
    console.log('🚀 Starting AutoNews.AI production server...');
    
    // Import and start the production server
    require('./dist/index.js');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start deployment
deploy();