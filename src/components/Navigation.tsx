
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-xl font-semibold tracking-tight">
              Portfolio
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
                Features
              </a>
              <a href="#templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
                Templates
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
                Pricing
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Sign In
            </Button>
            <Button size="sm" className="text-sm font-medium premium-shadow bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#templates" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Templates
              </a>
              <a href="#pricing" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </a>
              <div className="pt-4 pb-2 space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Sign In
                </Button>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
