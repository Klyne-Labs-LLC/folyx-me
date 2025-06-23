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
  
  // Calculate responsive offset for fixed navbar
  const defaultOffset = window.innerWidth < 768 ? 80 : 90;
  const offset = customOffset ?? defaultOffset;
  
  const targetPosition = targetElement.offsetTop - offset;
  
  window.scrollTo({
    top: Math.max(0, targetPosition), // Ensure we don't scroll to negative position
    behavior: 'smooth'
  });
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
