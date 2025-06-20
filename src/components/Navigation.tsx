
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold gradient-text">
              PortfolioCraft
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
                Features
              </a>
              <a href="#templates" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
                Templates
              </a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
                Pricing
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                Sign In
              </Button>
              <Button className="bg-primary/90 hover:bg-primary backdrop-blur-sm border border-white/20">
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
