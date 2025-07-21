import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { logger, logPageView, logUserAction } from '@/lib/logger'

export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    logPageView(pathname, document.referrer)
  }, [pathname])
}

export function useErrorHandler() {
  const handleError = useCallback((error: Error | unknown, context?: Record<string, any>) => {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Unhandled error', err, context)
  }, [])

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, { type: 'unhandledRejection' })
    }

    const handleWindowError = (event: ErrorEvent) => {
      handleError(event.error, {
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleWindowError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleWindowError)
    }
  }, [handleError])

  return { handleError }
}

export function useActionLogger() {
  const logAction = useCallback((action: string, details?: Record<string, any>) => {
    logUserAction(action, {
      ...details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    })
  }, [])

  return { logAction }
}

export function usePerformanceLogger(componentName: string) {
  useEffect(() => {
    logger.time(`${componentName}-mount`)
    
    return () => {
      logger.timeEnd(`${componentName}-mount`)
    }
  }, [componentName])

  const measureAction = useCallback((actionName: string, action: () => void | Promise<void>) => {
    logger.time(`${componentName}-${actionName}`)
    
    const result = action()
    
    if (result instanceof Promise) {
      result.finally(() => {
        logger.timeEnd(`${componentName}-${actionName}`)
      })
    } else {
      logger.timeEnd(`${componentName}-${actionName}`)
    }
    
    return result
  }, [componentName])

  return { measureAction }
}