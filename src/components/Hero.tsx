
import React, { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { scrollToSection } from "@/lib/utils";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
      id="hero"
      ref={heroRef}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-purple-100/30" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="section-container relative z-10 text-center opacity-0 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Tech chip */}
          <div className="tech-chip mx-auto mb-4 sm:mb-6 inline-flex items-center">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" />
            <span>AI-Powered Portfolio Generation</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            The Last Portfolio You'll <br className="hidden sm:inline" />
            <span className="text-blue-500">Ever Need to Build</span>
          </h1>
          
          {/* Detailed service description for Stripe compliance */}
          <div className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed space-y-4">
            <p>
              <strong>Folyx</strong> is an AI-powered professional portfolio generation service that automatically 
              creates stunning, professional portfolios by analyzing your social media profiles, particularly 
              LinkedIn, Twitter, and GitHub.
            </p>
            <p>
              Our advanced artificial intelligence technology transforms your scattered online presence into 
              a cohesive, professional portfolio website that showcases your skills, experience, and achievements 
              to potential employers and clients.
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              Service includes: AI content analysis, professional design generation, instant website deployment, 
              custom domain setup, and ongoing portfolio updates as your career evolves.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 sm:mb-12">
            <a 
              href="#get-started" 
              className="button-primary group flex items-center justify-center w-full sm:w-auto touch-target text-sm sm:text-base"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('get-started');
              }}
            >
              Get Your AI Portfolio
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium border-2 border-white">J</div>
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-medium border-2 border-white">M</div>
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-medium border-2 border-white">S</div>
              </div>
              <span>58 professionals joined early access</span>
            </div>
            <div className="text-yellow-500">★★★★★</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
