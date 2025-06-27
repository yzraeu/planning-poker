# Vercel Deployment Configuration Guide

## Prerequisites
- GitHub repository with your planning poker code
- Vercel account (sign up at https://vercel.com)
- PostgreSQL database (we'll set up Vercel Postgres)

## Step-by-Step Vercel Configuration

### 1. Connect Repository to Vercel

1. **Log into Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Sign in with GitHub (recommended)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your planning-poker repository
   - Click "Import"

### 2. Configure Build Settings

1. **Framework Preset**
   - Vercel should auto-detect "Other" - keep this setting
   - Root Directory: Leave empty (uses root)

2. **Build and Output Settings**
   - Build Command: `npm run build`
   - Output Directory: Leave empty (handled by vercel.json)
   - Install Command: `npm install`

3. **Node.js Version**
   - Go to Project Settings → General
   - Set Node.js Version to `18.x` or `20.x`

### 3. Set Up Environment Variables

1. **Go to Environment Variables**
   - In your project dashboard, click "Settings"
   - Click "Environment Variables" in the sidebar

2. **Add Production Variables**
   ```
   Variable Name: NODE_ENV
   Value: production
   Environment: Production
   
   Variable Name: DATABASE_URL  
   Value: [Will be set after database setup]
   Environment: Production
   
   Variable Name: CORS_ORIGIN
   Value: https://your-project-name.vercel.app
   Environment: Production
   
   Variable Name: VITE_SERVER_URL
   Value: https://your-project-name.vercel.app
   Environment: Production
   
   Variable Name: VITE_CLIENT_URL
   Value: https://your-project-name.vercel.app
   Environment: Production
   ```

3. **Add Development Variables** (Optional)
   ```
   Variable Name: NODE_ENV
   Value: development
   Environment: Development
   
   Variable Name: DATABASE_URL
   Value: sqlite:./database/poker.db
   Environment: Development
   
   Variable Name: CORS_ORIGIN
   Value: http://localhost:5173
   Environment: Development
   
   Variable Name: VITE_SERVER_URL
   Value: http://localhost:3001
   Environment: Development
   
   Variable Name: VITE_CLIENT_URL
   Value: http://localhost:5173
   Environment: Development
   ```

### 4. Set Up Vercel Postgres Database

1. **Add Postgres Integration**
   - In project dashboard, go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., "planning-poker-db")
   - Select region closest to your users
   - Click "Create"

2. **Connect Database to Project**
   - After creation, click "Connect Project"
   - Select your planning-poker project
   - This automatically adds database environment variables

3. **Update DATABASE_URL Variable**
   - The DATABASE_URL should now be automatically set
   - Verify in Settings → Environment Variables
   - Should look like: `postgresql://username:password@hostname:port/database`

### 5. Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update CORS_ORIGIN, VITE_SERVER_URL, VITE_CLIENT_URL
   - Change from `.vercel.app` to your custom domain

### 6. Deploy and Test

1. **Trigger First Deployment**
   - Push to your main branch, or
   - Click "Redeploy" in Vercel dashboard

2. **Monitor Build Logs**
   - Click on the deployment to see build logs
   - Check for any errors in build process

3. **Test Database Migration**
   - Migrations should run automatically during build
   - Check build logs for "Running database migrations..."

### 7. Verify Deployment

1. **Test Basic Functionality**
   - Visit your deployed URL
   - Check that the app loads
   - Verify Socket.io connections work

2. **Test Database Connection**
   - Try creating a room
   - Verify data persistence

## Troubleshooting Common Issues

### Build Failures

**Issue**: `npm run build` fails
- **Solution**: Check package.json scripts are correct
- Ensure all dependencies are in package.json, not just devDependencies

**Issue**: TypeScript compilation errors
- **Solution**: Run `npm run build` locally first to fix TS errors

### Database Issues

**Issue**: Database connection timeouts
- **Solution**: Check DATABASE_URL format and credentials
- Verify Vercel Postgres is properly connected

**Issue**: Migration fails
- **Solution**: Check migration script permissions
- Verify database schema files exist

### Environment Variable Issues

**Issue**: Variables not loading
- **Solution**: Ensure variables are set for correct environment (Production)
- Client variables must start with `VITE_`

### Socket.io Issues

**Issue**: WebSocket connections fail
- **Solution**: Vercel supports WebSocket connections by default
- Check CORS configuration in server code

## Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] Database connections work
- [ ] Room creation/joining works  
- [ ] Real-time features work (Socket.io)
- [ ] All environment variables are set correctly
- [ ] Build logs show no errors
- [ ] Database migrations completed successfully

## Useful Vercel CLI Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from local machine
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Pull environment variables
vercel env pull .env.local
```

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up monitoring (optional)
3. Configure custom domain if needed
4. Set up CI/CD pipeline (Phase 4)

---

**Note**: Replace `your-project-name` with your actual Vercel project name throughout this guide.