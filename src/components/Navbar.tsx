import React, { useState, useEffect } from "react";
import { cn, scrollToSection as utilScrollToSection, getActiveSection } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Track active section for visual feedback using utility function
      const sections = ['home', 'why-us', 'integrations', 'waitlist-form'];
      setActiveSection(getActiveSection(sections));
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash navigation when component mounts or location changes
  useEffect(() => {
    // Only process hash on home page
    if (location.pathname === '/' && location.hash) {
      // Remove the '#' from the hash
      const sectionId = location.hash.substring(1);
      
      // Wait a bit for the page to render, then scroll to the section
      setTimeout(() => {
        utilScrollToSection(sectionId);
      }, 100);
    }
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  /**
   * Handles navigation to sections - scrolls if on home page, navigates if on other pages
   * @param {string} sectionId - The ID of the target section
   * @param {Event} e - The click event to prevent default behavior
   */
  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close mobile menu first if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
    
    // If we're not on the home page, navigate to home with hash
    if (location.pathname !== '/') {
      // Navigate to home page with section hash
      navigate(`/#${sectionId}`);
      return;
    }
    
    // If we're on the home page, scroll to section
    if (isMenuOpen) {
      // Add delay for mobile menu to close
      setTimeout(() => {
        utilScrollToSection(sectionId);
      }, 100);
    } else {
      // Direct scroll for desktop
      utilScrollToSection(sectionId);
    }
  };

  /**
   * Navigation link component with active state styling
   */
  const NavLink = ({ 
    href, 
    children, 
    sectionId, 
    className = "" 
  }: { 
    href: string; 
    children: React.ReactNode; 
    sectionId: string;
    className?: string;
  }) => (
    <a 
      href={href}
      className={cn(
        "nav-link transition-colors duration-200",
        activeSection === sectionId 
          ? "text-purple-600 font-semibold" 
          : "text-gray-700 hover:text-purple-600",
        className
      )}
      onClick={(e) => scrollToSection(sectionId, e)}
    >
      {children}
    </a>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-sm" 
          : "bg-transparent"
      )}
      style={{
        // Ensure navbar stays visible on mobile
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0
      }}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="/" 
          className="flex items-center flex-shrink-0"
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname === '/') {
              // If on home page, scroll to top
              utilScrollToSection('home');
            } else {
              // If on other page, navigate to home
              navigate('/');
            }
          }}
          aria-label="Folyx - Go to home"
          style={{ minWidth: '120px' }}
        >
          <div 
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent font-display italic"
            style={{ 
              fontFamily: 'Brockmann, "Playfair Display", Georgia, serif',
              paddingRight: '8px',
              paddingLeft: '4px',
              width: 'fit-content',
              minWidth: '100px',
              display: 'block',
              overflow: 'visible'
            }}
          >
            folyx
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 flex-shrink-0">
          <NavLink href="/#home" sectionId="home">
            Home
          </NavLink>
          <NavLink href="/#why-us" sectionId="why-us">
            Why Us
          </NavLink>
          <NavLink href="/#integrations" sectionId="integrations">
            Integrations
          </NavLink>
          <NavLink href="/#waitlist-form" sectionId="waitlist-form">
            Get Started
          </NavLink>
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-gray-700 p-3 focus:outline-none flex-shrink-0" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved dropdown style */}
      <div 
        className={cn(
          "absolute top-full left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg md:hidden transition-all duration-300 ease-in-out border-t border-gray-100",
          isMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible pointer-events-none"
        )}
        style={{
          zIndex: 9998, // Just below header but above everything else
          position: 'absolute'
        }}
      >
        <nav className="flex flex-col py-4 px-6">
          <a 
            href="/#home" 
            className={cn(
              "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
              activeSection === 'home' 
                ? "bg-purple-50 text-purple-600" 
                : "hover:bg-gray-100"
            )}
            onClick={(e) => scrollToSection('home', e)}
          >
            Home
          </a>
          <a 
            href="/#why-us" 
            className={cn(
              "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
              activeSection === 'why-us' 
                ? "bg-purple-50 text-purple-600" 
                : "hover:bg-gray-100"
            )}
            onClick={(e) => scrollToSection('why-us', e)}
          >
            Why Us
          </a>
          <a 
            href="/#integrations" 
            className={cn(
              "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
              activeSection === 'integrations' 
                ? "bg-purple-50 text-purple-600" 
                : "hover:bg-gray-100"
            )}
            onClick={(e) => scrollToSection('integrations', e)}
          >
            Integrations
          </a>
          <a 
            href="/#waitlist-form" 
            className={cn(
              "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
              activeSection === 'waitlist-form' 
                ? "bg-purple-50 text-purple-600" 
                : "hover:bg-gray-100"
            )}
            onClick={(e) => scrollToSection('waitlist-form', e)}
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
