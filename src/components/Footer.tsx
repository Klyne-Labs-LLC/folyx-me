import React from "react";
import { Link } from "react-router-dom";

/**
 * Footer component with improved mobile responsiveness
 * Simplified design with essential branding and navigation links
 */
const Footer = () => {
  const handlePageNavigation = () => {
    // Scroll to top smoothly when navigating to a new page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="w-full pt-4">
      {/* Card-based footer with background image */}
      <div 
        className="relative w-full min-h-24 md:min-h-28 overflow-hidden"
        style={{
          backgroundImage: 'url(/background-section1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/15" />
        
        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8 py-4">
          {/* Main footer content - Better mobile design */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
            
            {/* Left side - Brand info */}
            <div className="flex flex-col items-center md:items-start space-y-1">
              <div className="flex flex-col items-center md:items-start space-y-1">
                <div 
                  className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent font-display italic"
                  style={{ 
                    fontFamily: 'Brockmann, "Playfair Display", Georgia, serif',
                    paddingRight: '4px',
                    paddingLeft: '2px',
                    width: 'fit-content',
                    minWidth: '70px',
                    display: 'block',
                    overflow: 'visible'
                  }}
                >
                  folyx
                </div>
                <span className="text-white/80 text-sm font-medium">
                  Portfolio on Autopilot
                </span>
              </div>
            </div>
            
            {/* Center - Policy Links - Horizontal row on mobile, spaced on desktop */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-x-6">
              <Link 
                to="/contact" 
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={handlePageNavigation}
              >
                Contact Us
              </Link>
              <Link 
                to="/privacy-policy" 
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={handlePageNavigation}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={handlePageNavigation}
              >
                Terms of Service
              </Link>
              <Link 
                to="/refund-policy" 
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={handlePageNavigation}
              >
                Refund Policy
              </Link>
              <Link 
                to="/cancellation-policy" 
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={handlePageNavigation}
              >
                Cancellation Policy
              </Link>
            </div>
            
            {/* Right side - Contact info and copyright */}
            <div className="flex flex-col items-center md:items-end space-y-1 pt-1 md:pt-0">
              <p className="text-white/80 text-xs font-medium">
                anian@folyx.me
              </p>
              <p className="text-white/70 text-xs">
                © 2025 Folyx Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
