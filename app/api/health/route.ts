import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  }

  // Check external dependencies
  const checks = {
    api: await checkApiHealth(),
  }

  const allHealthy = Object.values(checks).every(check => check)

  return NextResponse.json(
    {
      ...health,
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  )
}

async function checkApiHealth(): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}