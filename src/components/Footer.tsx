import React from "react";

/**
 * Minimal footer component using card design with background image
 * Features thin layout with essential information only
 */
const Footer = () => {
  return (
    <footer className="w-full pt-6">
      {/* Card-based footer with background image - truly dissolved with screen bottom */}
      <div 
        className="relative w-full h-16 md:h-20 overflow-hidden"
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
        <div className="relative z-10 h-full flex items-center justify-between px-4 md:px-8">
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
              Portfolio on Autopilot
            </span>
          </div>
          
          {/* Right side - Minimal info */}
          <div className="text-right">
            <p className="text-white/80 text-xs font-medium">
              © 2025 Folyx
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
