# Monitoring & Logging Guide

## Overview

The application includes comprehensive monitoring and logging:
- **Client-side logging**: Browser console + server collection
- **Error tracking**: Error boundaries + global handlers
- **Performance monitoring**: Web Vitals + custom metrics
- **User analytics**: Page views + user actions
- **Health checks**: API endpoint for uptime monitoring

## Logging

### Logger Usage

```typescript
import { logger } from '@/lib/logger'

// Debug (dev only)
logger.debug('Component rendered', { props })

// Info
logger.info('User logged in', { userId })

// Warning
logger.warn('API rate limit approaching', { remaining: 10 })

// Error
logger.error('Payment failed', error, { orderId })

// Performance
logger.time('data-fetch')
// ... async operation
logger.timeEnd('data-fetch')
```

### Specialized Logging

```typescript
import { logApiError, logUserAction, logPageView } from '@/lib/logger'

// API errors
logApiError('/api/users', error, { method: 'POST' })

// User actions
logUserAction('button_click', { button: 'submit', page: 'checkout' })

// Page views (automatic in layout)
logPageView('/products', document.referrer)
```

### Using Hooks

```typescript
import { useActionLogger, usePerformanceLogger } from '@/hooks/use-logger'

function MyComponent() {
  const { logAction } = useActionLogger()
  const { measureAction } = usePerformanceLogger('MyComponent')
  
  const handleClick = () => {
    logAction('form_submit', { formId: 'contact' })
    
    measureAction('api-call', async () => {
      await api.submitForm(data)
    })
  }
}
```

## Error Handling

### Error Boundaries

Automatically catch and log React errors:

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

### Global Error Handler

Automatically catches:
- Unhandled promise rejections
- Window error events
- Network errors

## Performance Monitoring

### Web Vitals

Automatically collected and sent to `/api/vitals`:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- TTFB (Time to First Byte)

### Custom Performance Metrics

```typescript
// Manual timing
logger.time('custom-operation')
doSomething()
logger.timeEnd('custom-operation')

// Component performance
const { measureAction } = usePerformanceLogger('ComponentName')
measureAction('render', () => {
  // expensive operation
})
```

## Health Checks

### API Endpoint

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "0.1.0",
  "environment": "production",
  "uptime": 3600,
  "checks": {
    "api": true
  }
}
```

## Production Monitoring

### Environment Variables

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Sentry Integration

Error tracking and performance monitoring:
- Automatic error capture
- Source maps for debugging
- User context
- Release tracking

### Analytics Events

Track user behavior:

```typescript
import { monitoring } from '@/lib/monitoring'

// Track event
monitoring.trackEvent('purchase_completed', {
  amount: 5000000,
  currency: 'UZS',
  items: 1,
})

// Identify user
monitoring.identifyUser(userId, {
  phone: user.phone_number,
  created_at: user.created_at,
})
```

## Dashboards

### Recommended Setup

1. **Sentry**: Error tracking and performance
2. **Google Analytics**: User behavior and conversions
3. **Mixpanel**: Product analytics and funnels
4. **UptimeRobot**: Uptime monitoring
5. **Railway Metrics**: Infrastructure monitoring

### Key Metrics to Track

1. **Performance**
   - Page load time
   - API response time
   - Web Vitals scores

2. **Errors**
   - Error rate
   - Error types
   - Affected users

3. **User Behavior**
   - Page views
   - Conversion rate
   - User flow

4. **Business Metrics**
   - Applications created
   - Offers viewed
   - Completion rate

## Debugging

### Development

1. Check browser console for logs
2. Use React DevTools
3. Enable debug mode: `localStorage.setItem('debug', 'true')`

### Production

1. Check Sentry for errors
2. Review server logs in Railway
3. Use source maps for debugging
4. Check health endpoint

## Best Practices

1. **Don't log sensitive data**
   - No passwords
   - No personal data
   - No tokens

2. **Use appropriate log levels**
   - Debug: Development only
   - Info: Important events
   - Warn: Potential issues
   - Error: Actual errors

3. **Add context to logs**
   - User ID
   - Request ID
   - Component name
   - Action type

4. **Monitor key user flows**
   - Registration
   - Application submission
   - Offer selection

5. **Set up alerts**
   - High error rate
   - Performance degradation
   - API failures