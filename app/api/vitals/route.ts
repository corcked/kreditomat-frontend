import { NextRequest, NextResponse } from 'next/server'

interface WebVitalMetric {
  metric: string
  value: number
  label: string
  page: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json() as WebVitalMetric
    
    // Log the metric
    console.log('Web Vital:', JSON.stringify(metric))
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, etc.
      // await sendToAnalytics(metric)
    }
    
    // Store critical metrics for monitoring
    if (['FCP', 'LCP', 'CLS', 'FID', 'TTFB'].includes(metric.metric)) {
      // Could store in Redis or database for dashboards
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process web vital:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}