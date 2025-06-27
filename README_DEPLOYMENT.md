# AutoNews.AI Production Deployment Guide

## Security Compliance & Production Deployment

This guide addresses the Replit deployment security requirements that block development commands in production environments.

## Issue Resolution

**Error:** `Deployment blocked due to security measure preventing 'dev' command in production`

**Root Cause:** The `.replit` file is configured with `npm run dev` which triggers development mode security blocks.

**Solution:** Use production-compliant deployment scripts that enforce production environment settings.

## Production Deployment Options

### Option 1: Automated Production Deployment (Recommended)
```bash
node deploy.js
```

**Features:**
- Security validation (blocks development mode)
- Automatic build process if needed
- Production environment enforcement
- Graceful shutdown handling
- Comprehensive error handling

### Option 2: Quick Production Start
```bash
node start.js
```

**Features:**
- Fast production startup
- Security validation
- Requires pre-built application
- Production mode enforcement

### Option 3: Manual Production Build & Start
```bash
# Step 1: Build for production
npm run build

# Step 2: Start in production mode
NODE_ENV=production node dist/index.js
```

## Security Features

Both deployment scripts include:

1. **Environment Validation**
   - Forces `NODE_ENV=production`
   - Blocks development mode execution
   - Validates required environment variables

2. **Build Verification**
   - Checks for production build artifacts
   - Ensures `dist/index.js` exists
   - Prevents startup without proper build

3. **Production Compliance**
   - No development dependencies loaded
   - Production-optimized server configuration
   - Security headers and middleware enabled

## Deployment Configuration

### Current Configuration Issue
The `.replit` file contains:
```toml
[deployment]
run = ["sh", "-c", "npm run dev"]  # ← Security issue
```

### Required Solution
Since `.replit` cannot be modified, use the deployment scripts directly:

**For Replit Deployments:**
- Use `node deploy.js` as the run command
- Or use `node start.js` for pre-built applications

### Environment Variables
Ensure these are configured:
- `NODE_ENV=production` (enforced by scripts)
- `DATABASE_URL` (required for database connection)

## Build Process

The production build includes:
- **Frontend:** Vite build with optimizations
- **Backend:** esbuild bundle with Node.js targeting
- **Output:** `dist/` directory with production assets
- **Static Assets:** Optimized and served from `dist/public`

## Verification Steps

1. **Security Check:** Scripts validate production mode
2. **Build Check:** Verifies `dist/index.js` exists
3. **Environment Check:** Validates required variables
4. **Startup Verification:** Confirms server starts successfully

## Troubleshooting

### "Development mode blocked"
- Ensure using `deploy.js` or `start.js`
- Never use `npm run dev` in production

### "Production build not found"
- Run `npm run build` first
- Or use `deploy.js` for automatic building

### "Missing environment variables"
- Verify `DATABASE_URL` is set
- Check Replit environment configuration

## Production Optimizations

✅ **Security Headers:** Helmet middleware enabled  
✅ **Compression:** Response compression active  
✅ **Rate Limiting:** API protection configured  
✅ **Session Security:** Secure session management  
✅ **Static Assets:** Optimized serving  
✅ **Error Handling:** Production error logging  
✅ **Graceful Shutdown:** Clean process termination

## Deployment Scripts Available

1. `deploy.js` - Full production deployment with build verification
2. `start.js` - Simple production starter with build check
3. `npm run start` - Direct production start (requires existing build)

## Verification

After deployment, verify the application is running correctly:
- Check the server logs for "🚀 AutoNews.AI Server Started Successfully"
- Verify the environment shows "production" mode
- Test the application endpoints

## Security Notes

The production configuration includes:
- Security headers and middleware
- Rate limiting and DDoS protection
- Input validation and sanitization
- Compression and optimization
- Error handling without sensitive data exposure