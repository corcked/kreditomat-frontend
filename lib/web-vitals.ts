import { NextWebVitalsMetric } from 'next/app'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric)
  }
  
  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      label: metric.label,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    })
    
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body)
    } else {
      // Fallback to fetch
      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently fail
      })
    }
  }
  
  // Alert on poor performance
  switch (metric.name) {
    case 'FCP': // First Contentful Paint
      if (metric.value > 3000) {
        console.warn('Poor FCP:', metric.value)
      }
      break
    case 'LCP': // Largest Contentful Paint
      if (metric.value > 4000) {
        console.warn('Poor LCP:', metric.value)
      }
      break
    case 'CLS': // Cumulative Layout Shift
      if (metric.value > 0.25) {
        console.warn('Poor CLS:', metric.value)
      }
      break
    case 'FID': // First Input Delay
      if (metric.value > 300) {
        console.warn('Poor FID:', metric.value)
      }
      break
    case 'TTFB': // Time to First Byte
      if (metric.value > 800) {
        console.warn('Poor TTFB:', metric.value)
      }
      break
  }
}