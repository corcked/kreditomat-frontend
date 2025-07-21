// Monitoring integrations for production

interface MonitoringConfig {
  sentryDsn?: string
  mixpanelToken?: string
  googleAnalyticsId?: string
}

class Monitoring {
  private initialized = false
  
  init(config: MonitoringConfig) {
    if (this.initialized || process.env.NODE_ENV !== 'production') {
      return
    }
    
    this.initialized = true
    
    // Initialize Sentry
    if (config.sentryDsn) {
      this.initSentry(config.sentryDsn)
    }
    
    // Initialize Mixpanel
    if (config.mixpanelToken) {
      this.initMixpanel(config.mixpanelToken)
    }
    
    // Initialize Google Analytics
    if (config.googleAnalyticsId) {
      this.initGoogleAnalytics(config.googleAnalyticsId)
    }
  }
  
  private initSentry(dsn: string) {
    // Dynamic import to reduce bundle size
    import('@sentry/nextjs').then(({ init }) => {
      init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        debug: false,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        integrations: [
          // Add custom integrations
        ],
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request?.cookies) {
            delete event.request.cookies
          }
          return event
        },
      })
    }).catch(console.error)
  }
  
  private initMixpanel(token: string) {
    // Dynamic import
    import('mixpanel-browser').then(({ default: mixpanel }) => {
      mixpanel.init(token, {
        debug: false,
        track_pageview: true,
        persistence: 'localStorage',
      })
    }).catch(console.error)
  }
  
  private initGoogleAnalytics(id: string) {
    // Add GA script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    script.async = true
    document.head.appendChild(script)
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', id, {
      page_path: window.location.pathname,
    })
  }
  
  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') return
    
    // Send to Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, properties)
    }
    
    // Send to GA
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties)
    }
  }
  
  // Identify user
  identifyUser(userId: string, traits?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') return
    
    // Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser({ id: userId, ...traits })
    }
    
    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.identify(userId)
      if (traits) {
        (window as any).mixpanel.people.set(traits)
      }
    }
  }
  
  // Clear user data (on logout)
  clearUser() {
    if (process.env.NODE_ENV !== 'production') return
    
    // Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser(null)
    }
    
    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.reset()
    }
  }
}

// Singleton instance
export const monitoring = new Monitoring()

// Initialize on client side
if (typeof window !== 'undefined') {
  monitoring.init({
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  })
}