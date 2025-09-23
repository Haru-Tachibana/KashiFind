// Utility functions for color detection and text color adjustment

/**
 * Get the brightness of a color (0-255)
 * @param {string} color - Color in hex format (#RRGGBB)
 * @returns {number} Brightness value (0-255)
 */
export function getColorBrightness(color) {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness using luminance formula
  return Math.round((r * 299 + g * 587 + b * 114) / 1000);
}

/**
 * Get the dominant color from an image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} Dominant color in hex format
 */
export function getDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to a smaller size for performance
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, size, size);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Calculate average color
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);
        
        // Convert to hex
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        resolve(hex);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Get appropriate text color based on background brightness
 * @param {string} backgroundColor - Background color in hex format
 * @returns {string} Text color class name
 */
export function getTextColorClass(backgroundColor) {
  if (!backgroundColor) return 'text-gray-900';
  
  const brightness = getColorBrightness(backgroundColor);
  
  // If background is light, use dark text; if dark, use light text
  return brightness > 128 ? 'text-gray-900' : 'text-white';
}

/**
 * Get appropriate text color with opacity based on background brightness
 * @param {string} backgroundColor - Background color in hex format
 * @param {string} variant - Text variant (primary, secondary, muted)
 * @returns {string} Text color class name with opacity
 */
export function getTextColorWithOpacity(backgroundColor, variant = 'primary') {
  if (!backgroundColor) {
    switch (variant) {
      case 'primary': return 'text-gray-900';
      case 'secondary': return 'text-gray-700';
      case 'muted': return 'text-gray-500';
      default: return 'text-gray-900';
    }
  }
  
  const brightness = getColorBrightness(backgroundColor);
  
  if (brightness > 128) {
    // Light background - use dark text
    switch (variant) {
      case 'primary': return 'text-gray-900';
      case 'secondary': return 'text-gray-700';
      case 'muted': return 'text-gray-500';
      default: return 'text-gray-900';
    }
  } else {
    // Dark background - use light text
    switch (variant) {
      case 'primary': return 'text-white';
      case 'secondary': return 'text-white/90';
      case 'muted': return 'text-white/70';
      default: return 'text-white';
    }
  }
}

/**
 * Get text color classes for different UI elements based on background
 * @param {string} backgroundColor - Background color in hex format
 * @returns {object} Object with different text color classes
 */
export function getTextColorClasses(backgroundColor) {
  if (!backgroundColor) {
    return {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
      error: 'text-red-600',
      success: 'text-green-600'
    };
  }
  
  const brightness = getColorBrightness(backgroundColor);
  
  if (brightness > 128) {
    // Light background - use dark text
    return {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
      error: 'text-red-600',
      success: 'text-green-600'
    };
  } else {
    // Dark background - use light text
    return {
      primary: 'text-white',
      secondary: 'text-white/90',
      muted: 'text-white/70',
      accent: 'text-blue-300',
      error: 'text-red-300',
      success: 'text-green-300'
    };
  }
}

/**
 * Get background color from CSS background-image property
 * @param {string} backgroundImage - CSS background-image value
 * @returns {Promise<string|null>} Background color or null if not found
 */
export async function getBackgroundColorFromImage(backgroundImage) {
  if (!backgroundImage || !backgroundImage.includes('url(')) {
    return null;
  }
  
  try {
    // Extract URL from background-image: url('...')
    const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (!urlMatch) return null;
    
    const imageUrl = urlMatch[1];
    return await getDominantColor(imageUrl);
  } catch (error) {
    console.error('Error getting background color from image:', error);
    return null;
  }
}
