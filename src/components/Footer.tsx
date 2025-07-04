
import React from "react";
import { Link } from "react-router-dom";

/**
 * Footer component with Stripe compliance requirements
 * Includes all required business information and policy links
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
    <footer className="w-full pt-6">
      {/* Card-based footer with background image - truly dissolved with screen bottom */}
      <div 
        className="relative w-full min-h-32 md:min-h-40 overflow-hidden"
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
        <div className="relative z-10 h-full flex flex-col justify-between px-4 md:px-8 py-6">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            {/* Left side - Brand and business info */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
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
                <span className="text-white/70 text-xs hidden sm:block">
                  Portfolio on Autopilot
                </span>
              </div>
              <div className="text-white/80 text-xs">
                <p>AI-Powered Portfolio Generation Service</p>
                <p>Professional portfolios built automatically from your social profiles</p>
              </div>
            </div>
            
            {/* Center - Policy Links */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
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
            
            {/* Right side - Contact info */}
            <div className="text-right">
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
