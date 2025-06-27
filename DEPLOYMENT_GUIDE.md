# AutoNews.AI Deployment Guide

## Quick Fix for Replit Deployment

**SOLUTION:** Change your deployment run command from `npm run dev` to `node deploy.js`

## Why This Works

Replit blocks `npm run dev` in production because it's a development command. Our production scripts bypass this security restriction by:

1. Forcing production environment (`NODE_ENV=production`)
2. Building the application automatically if needed
3. Starting the server with production optimizations
4. Validating all security requirements

## Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
node deploy.js
```
- Builds automatically if needed
- Validates environment
- Starts production server
- Handles all security requirements

### Option 2: Quick Start
```bash
node start.js
```
- For pre-built applications
- Fast startup
- Production validation

### Option 3: Manual Process
```bash
npm run build
NODE_ENV=production node dist/index.js
```
- Step-by-step control
- Manual build process

## Environment Variables Required

- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV` - Automatically set to production

## What the Scripts Do

1. **Security Validation**
   - Blocks development mode
   - Enforces production environment
   - Validates required variables

2. **Build Process**
   - Frontend: Vite optimization
   - Backend: esbuild bundling
   - Assets: Static file optimization

3. **Production Start**
   - Optimized server configuration
   - Security headers enabled
   - Performance monitoring active

## Status: Ready for Deployment

All scripts are configured and tested. Simply change your deployment command to `node deploy.js` and deploy normally.