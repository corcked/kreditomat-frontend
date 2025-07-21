type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private sendToServer(entries: LogEntry[]): void {
    if (this.isDevelopment) return

    // Send logs to server
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    }).catch(() => {
      // Fail silently
    })
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
      console[consoleMethod](this.formatMessage(entry), error)
    }

    // Add to buffer
    this.logBuffer.push(entry)

    // Send to server when buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const err = error instanceof Error ? error : new Error(String(error))
    this.log('error', message, { ...context, stack: err.stack }, err)
  }

  flush(): void {
    if (this.logBuffer.length === 0) return
    
    const entries = [...this.logBuffer]
    this.logBuffer = []
    this.sendToServer(entries)
  }

  // Performance logging
  time(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`)
    }
  }

  timeEnd(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`)
      try {
        performance.measure(label, `${label}-start`, `${label}-end`)
        const measure = performance.getEntriesByName(label)[0]
        this.info(`Performance: ${label}`, { duration: measure.duration })
      } catch (e) {
        // Ignore if start mark doesn't exist
      }
    }
  }
}

// Singleton instance
export const logger = new Logger()

// Error boundary logging
export function logErrorBoundary(error: Error, errorInfo: { componentStack: string }): void {
  logger.error('React Error Boundary', error, {
    componentStack: errorInfo.componentStack,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  })
}

// API error logging
export function logApiError(endpoint: string, error: Error | unknown, context?: Record<string, any>): void {
  logger.error(`API Error: ${endpoint}`, error, {
    ...context,
    endpoint,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  })
}

// User action logging
export function logUserAction(action: string, details?: Record<string, any>): void {
  logger.info(`User Action: ${action}`, details)
}

// Page view logging
export function logPageView(path: string, referrer?: string): void {
  logger.info('Page View', {
    path,
    referrer,
    timestamp: new Date().toISOString(),
  })
}

// Flush logs on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush()
  })
}