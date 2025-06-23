
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-white shadow-sm" 
          : "bg-white/90 backdrop-blur-sm"
      )}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="#" 
          className="flex items-center flex-shrink-0 group"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Folyx"
          style={{ minWidth: '140px' }}
        >
          <div 
            className="relative text-2xl sm:text-3xl font-bold text-slate-800 font-sans tracking-tight transition-all duration-300 group-hover:scale-105"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '900',
              paddingRight: '8px',
              paddingLeft: '4px',
              width: 'fit-content',
              minWidth: '120px',
              display: 'block',
              overflow: 'visible'
            }}
          >
            <span className="relative">
              <span className="bg-gradient-to-r from-slate-800 via-blue-700 to-slate-800 bg-clip-text text-transparent">
                folyx
              </span>
              {/* Subtle underline accent */}
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-blue-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 flex-shrink-0">
          <a 
            href="#" 
            className="text-slate-700 hover:text-blue-600 py-2 transition-colors duration-300 font-medium"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
          >
            Home
          </a>
          <a href="#why-ai" className="text-slate-700 hover:text-blue-600 py-2 transition-colors duration-300 font-medium">Why Us</a>
          <a href="#integrations" className="text-slate-700 hover:text-blue-600 py-2 transition-colors duration-300 font-medium">Integrations</a>
          <a href="#details" className="text-slate-700 hover:text-blue-600 py-2 transition-colors duration-300 font-medium">Get Started</a>
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-slate-700 p-3 focus:outline-none flex-shrink-0" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved dropdown style */}
      <div className={cn(
        "absolute top-full left-0 right-0 z-40 bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out border-t border-slate-100",
        isMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible"
      )}>
        <nav className="flex flex-col py-4 px-6">
          <a 
            href="#" 
            className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" 
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Home
          </a>
          <a 
            href="#why-ai" 
            className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Why Us
          </a>
          <a 
            href="#integrations" 
            className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Integrations
          </a>
          <a 
            href="#details" 
            className="text-lg font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
