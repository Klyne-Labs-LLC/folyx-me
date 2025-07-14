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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      className="w-5 h-5"
                    >
                      <g transform="translate(16, 16) scale(0.12) translate(-250, -250)">
                        <path
                          d="M 286.0884705 239.6364288 L 286.0884705 293.6871643 L 247.72813420000003 293.6871643 L 216.63769540000004 262.6018677 L 216.63769540000004 276.4438477 L 243.66307080000004 303.4692078 L 243.66307080000004 331.3127747 L 189.61747750000004 331.3127747 L 189.61747750000004 179.2565613 L 249.99736030000003 239.6364289 L 286.0884705 239.6364289 z M 192.8900909 168.6872101 L 251.7983703 227.590332 L 310.3825073 227.590332 L 310.3825073 168.6872101 L 192.8900909 168.6872101 z"
                          fill="#fcf4b4"
                          stroke="none"
                        />
                      </g>
                    </svg>
                  </div>
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
