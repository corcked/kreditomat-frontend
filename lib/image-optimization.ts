// Image optimization utilities

export const getOptimizedImageUrl = (url: string, width?: number): string => {
  // If it's an external URL, return as is
  if (url.startsWith('http') || url.startsWith('//')) {
    return url
  }
  
  // For local images, add optimization parameters
  const params = new URLSearchParams()
  if (width) {
    params.set('w', width.toString())
    params.set('q', '75') // Quality 75%
  }
  
  return params.toString() ? `${url}?${params.toString()}` : url
}

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export const lazyLoadImage = (element: HTMLImageElement): void => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      }
    })
  })
  
  imageObserver.observe(element)
}

// Image dimensions for different use cases
export const imageSizes = {
  thumbnail: 150,
  card: 400,
  hero: 1200,
  full: 1920,
} as const

// Blur data URL generator for placeholder
export const getBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) return ''
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}