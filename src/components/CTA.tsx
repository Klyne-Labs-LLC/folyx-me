import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { scrollToSection } from "@/lib/utils";

const CTA = () => {
  const ctaRef = useRef<HTMLDivElement>(null);
  
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
    
    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }
    
    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white relative" id="get-started" ref={ctaRef}>
      {/* Background gradient at the top has been removed */}
      
      <div className="section-container relative z-10 opacity-0 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto glass-card p-6 sm:p-8 md:p-10 lg:p-14 text-center overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-blue-100/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gray-100/50 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>
          
          <div className="tech-chip mx-auto mb-4 sm:mb-6">
            <span>Start Building Today</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            Ready to Build Your <br className="hidden sm:inline" />
            <span className="text-blue-500">Professional Portfolio?</span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who've accelerated their careers with Folyx's AI-powered portfolio builder. Start free, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="https://app.folyx.me" 
              className="button-primary group flex items-center justify-center w-full sm:w-auto touch-target text-sm sm:text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started - Create Your Portfolio
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
