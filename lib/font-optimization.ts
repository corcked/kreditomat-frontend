// Font optimization utilities

export const preloadFonts = () => {
  if (typeof window === 'undefined') return
  
  const fontUrls = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-cyrillic.woff2',
  ]
  
  fontUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.href = url
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Font loading optimization
export const optimizeFontLoading = () => {
  if (typeof window === 'undefined' || !('fonts' in document)) return
  
  // Use font-display: swap for better performance
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/inter-cyrillic.woff2') format('woff2');
      unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
  `
  document.head.appendChild(style)
  
  // Preload critical text
  document.fonts.load('16px Inter').catch(() => {
    console.warn('Failed to preload Inter font')
  })
}