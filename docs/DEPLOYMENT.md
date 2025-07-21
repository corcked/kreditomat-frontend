# Frontend Deployment Guide

## Railway Deployment

### Prerequisites
- Railway account
- Railway CLI installed (optional)
- Backend API deployed and accessible

### Environment Variables

Set these in Railway dashboard:

```env
# Required
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Deployment Steps

#### Via Railway Dashboard

1. Create new project in Railway
2. Connect your GitHub repository
3. Select the `kreditomat-frontend` directory
4. Railway will auto-detect Next.js and use nixpacks
5. Set environment variables in Settings
6. Deploy

#### Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (if needed)
railway link [project-id]

# Set environment variables
railway variables set NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
railway variables set NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app

# Deploy
railway up
```

### Docker Deployment (Alternative)

```bash
# Build image
docker build -t kreditomat-frontend .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  kreditomat-frontend

# Push to registry
docker tag kreditomat-frontend your-registry/kreditomat-frontend:latest
docker push your-registry/kreditomat-frontend:latest
```

### Health Checks

The app includes health check endpoints:
- `/` - Main health check
- `/api/health` - API health check (if implemented)

### Performance Monitoring

1. Web Vitals are automatically collected
2. Check browser console for performance metrics in development
3. In production, metrics can be sent to analytics service

### Troubleshooting

#### Build Failures
- Check Node.js version (requires 20.x)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run typecheck`

#### Runtime Errors
- Verify environment variables are set correctly
- Check API URL is accessible from Railway
- Review Railway logs for errors

#### Performance Issues
- Enable bundle analyzer: `npm run build:analyze`
- Check for large dependencies
- Verify lazy loading is working

### SSL/HTTPS

Railway provides automatic SSL certificates. No additional configuration needed.

### Custom Domain

1. Add custom domain in Railway settings
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` environment variable

### Scaling

Railway automatically handles scaling. For manual control:
1. Go to service settings
2. Adjust instance size and count
3. Configure autoscaling rules

### Monitoring

1. Use Railway's built-in metrics
2. Set up external monitoring (optional):
   - Sentry for error tracking
   - Google Analytics for user analytics
   - Custom performance monitoring

### Rollback

Via Railway dashboard:
1. Go to deployments history
2. Click on previous successful deployment
3. Click "Redeploy"

Via CLI:
```bash
railway deployments
railway redeploy [deployment-id]
```