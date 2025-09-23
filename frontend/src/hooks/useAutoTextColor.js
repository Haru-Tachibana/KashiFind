import { useState, useEffect } from 'react';
import { getBackgroundColorFromImage, getTextColorClasses } from '../utils/colorUtils';

/**
 * Custom hook for automatic text color detection based on background
 * @param {string} backgroundImage - Background image URL
 * @returns {object} Text color classes and loading state
 */
export function useAutoTextColor(backgroundImage) {
  const [textColors, setTextColors] = useState({
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    accent: 'text-blue-600',
    error: 'text-red-600',
    success: 'text-green-600'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!backgroundImage) {
      // Default colors for no background
      setTextColors({
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-500',
        accent: 'text-blue-600',
        error: 'text-red-600',
        success: 'text-green-600'
      });
      return;
    }

    setIsLoading(true);
    
    getBackgroundColorFromImage(backgroundImage)
      .then(backgroundColor => {
        if (backgroundColor) {
          const colors = getTextColorClasses(backgroundColor);
          setTextColors(colors);
        } else {
          // Fallback to default colors
          setTextColors({
            primary: 'text-gray-900',
            secondary: 'text-gray-700',
            muted: 'text-gray-500',
            accent: 'text-blue-600',
            error: 'text-red-600',
            success: 'text-green-600'
          });
        }
      })
      .catch(error => {
        console.error('Error detecting text colors:', error);
        // Fallback to default colors
        setTextColors({
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          muted: 'text-gray-500',
          accent: 'text-blue-600',
          error: 'text-red-600',
          success: 'text-green-600'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [backgroundImage]);

  return { textColors, isLoading };
}
