import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smoothly scrolls to a section with proper offset for fixed navbar
 * @param sectionId - The ID of the target section
 * @param customOffset - Optional custom offset (defaults to responsive navbar height)
 */
export function scrollToSection(sectionId: string, customOffset?: number) {
  if (sectionId === 'home' || sectionId === 'hero' || sectionId === 'top') {
    // Scroll to top for hero section
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    return;
  }
  
  const targetElement = document.getElementById(sectionId);
  if (!targetElement) {
    console.warn(`Section with ID '${sectionId}' not found`);
    return;
  }
  
  // Calculate responsive offset for fixed navbar with better mobile detection
  const isMobile = window.innerWidth < 768;
  const defaultOffset = isMobile ? 120 : 90; // Further increased mobile offset for better positioning
  const offset = customOffset ?? defaultOffset;
  
  // Debug info for mobile scroll issues (remove in production)
  if (isMobile) {
    console.log(`Mobile scroll to: ${sectionId}, offset: ${offset}px`);
  }
  
  // Get element position with more accurate calculation
  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = rect.top + scrollTop - offset;
  
  // Add small delay for mobile to ensure DOM is ready
  const scrollDelay = isMobile ? 50 : 0;
  
  setTimeout(() => {
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
    
    // Fallback for mobile browsers that might not honor smooth behavior
    if (isMobile) {
      setTimeout(() => {
        const currentScroll = window.pageYOffset;
        const expectedScroll = Math.max(0, targetPosition);
        
        // If scroll didn't work properly, try again with instant scroll
        if (Math.abs(currentScroll - expectedScroll) > 50) {
          window.scrollTo({
            top: expectedScroll,
            behavior: 'auto' // Use instant scroll as fallback
          });
        }
      }, 300);
    }
  }, scrollDelay);
}

/**
 * Gets the currently active section based on scroll position
 * @param sections - Array of section IDs to check
 * @param offset - Offset for navbar height (defaults to 100px)
 * @returns The ID of the currently active section
 */
export function getActiveSection(sections: string[], offset: number = 100): string {
  const scrollPosition = window.scrollY + offset;
  
  // Reverse the array to check from bottom to top
  for (const sectionId of [...sections].reverse()) {
    const element = document.getElementById(sectionId);
    if (element && element.offsetTop <= scrollPosition) {
      return sectionId;
    }
  }
  
  // Default to first section if none match
  return sections[0] || '';
}
