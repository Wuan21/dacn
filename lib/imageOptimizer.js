// Image Optimization Utilities
// Giúp giảm lag khi load hình ảnh base64 lớn

// Cache cho images đã load
const imageCache = new Map()

/**
 * Compress base64 image để giảm size
 */
export function compressBase64Image(base64String, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cacheKey = `${base64String.substring(0, 50)}_${maxWidth}_${quality}`
    if (imageCache.has(cacheKey)) {
      return resolve(imageCache.get(cacheKey))
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Resize nếu quá lớn
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Convert về base64 với quality thấp hơn
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      
      // Cache result
      imageCache.set(cacheKey, compressedBase64)
      resolve(compressedBase64)
    }
    img.onerror = reject
    img.src = base64String
  })
}

/**
 * Validate và compress image file trước khi upload
 */
export async function prepareImageForUpload(file, maxSizeMB = 1, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Chỉ chấp nhận file ảnh: JPG, PNG, GIF, WEBP'))
    }

    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result
        
        // Check size
        const sizeInMB = (base64.length * 3) / 4 / (1024 * 1024)
        
        if (sizeInMB > maxSizeMB) {
          // Compress image
          const compressed = await compressBase64Image(base64, maxWidth, 0.7)
          resolve(compressed)
        } else {
          resolve(base64)
        }
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Lỗi đọc file ảnh'))
    reader.readAsDataURL(file)
  })
}

/**
 * Lazy load image component helper
 */
export function createLazyImageObserver(callback) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target)
        }
      })
    },
    {
      rootMargin: '50px',
      threshold: 0.01
    }
  )
}

/**
 * Clear image cache (gọi khi user logout hoặc cần clear memory)
 */
export function clearImageCache() {
  imageCache.clear()
}

/**
 * Get thumbnail version of image (smaller size for lists)
 */
export async function getThumbnail(base64String, size = 200) {
  return compressBase64Image(base64String, size, 0.6)
}
