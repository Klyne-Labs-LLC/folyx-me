
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-black/90 border-b border-white/20 shadow-2xl' 
        : 'backdrop-blur-xl bg-black/60 border-b border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center">
            <div className="text-lg md:text-xl font-semibold tracking-tight text-white hover:scale-105 transition-transform duration-200 cursor-pointer">
              folyx.me
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200">
              Sign In
            </Button>
            <Button size="sm" className="text-sm font-medium bg-white text-black hover:bg-zinc-200 shadow-sm hover:scale-105 transition-all duration-200">
              Get Started
            </Button>
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-zinc-400 hover:text-white p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-80 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-xl rounded-lg mt-2 border border-white/10">
            <a 
              href="#features" 
              className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            <a 
              href="#pricing" 
              className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="pt-4 pb-2 space-y-2 border-t border-white/10 mt-4">
              <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-400 hover:bg-white/5 hover:text-white">
                Sign In
              </Button>
              <Button size="sm" className="w-full bg-white text-black hover:bg-zinc-200">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
