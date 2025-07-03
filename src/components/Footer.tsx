
import React from "react";
import { Link } from "react-router-dom";

/**
 * Minimal footer component using card design with background image
 * Features thin layout with essential information and required legal links
 */
const Footer = () => {
  return (
    <footer className="w-full pt-6">
      {/* Card-based footer with background image - truly dissolved with screen bottom */}
      <div 
        className="relative w-full h-32 md:h-36 overflow-hidden"
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
        <div className="relative z-10 h-full flex flex-col justify-between px-4 md:px-8 py-4">
          {/* Top section - Brand and Legal Links */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Left side - Brand */}
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
                AI-Powered Professional Portfolios
              </span>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-xs text-white/80">
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund-policy" className="hover:text-white transition-colors">
                Refund Policy
              </Link>
              <Link to="/cancellation-policy" className="hover:text-white transition-colors">
                Cancellation Policy
              </Link>
            </div>
          </div>
          
          {/* Bottom section - Copyright and Business Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-white/70 space-y-2 md:space-y-0">
            <div>
              <p>© 2025 Folyx - AI-Powered Portfolio Generation Service</p>
              <p>Contact: support@folyx.com</p>
            </div>
            <div className="text-right">
              <p>Business Hours: Mon-Fri 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
