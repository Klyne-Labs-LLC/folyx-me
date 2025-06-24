import React, { useEffect, useRef, useState } from "react";
import { cn, scrollToSection } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import LottieAnimation from "./LottieAnimation";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [lottieData, setLottieData] = useState<unknown>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [localIncrement, setLocalIncrement] = useState(0);
  const { count, loading } = useWaitlistCount();

  useEffect(() => {
    // Clear any stored increment on page load/refresh since DB count will now include it
    localStorage.removeItem('waitlistIncrement');
    setLocalIncrement(0);

    // Listen for custom event when form is submitted on same page
    const handleWaitlistSubmit = () => {
      setLocalIncrement(1);
    };

    window.addEventListener('waitlistSubmitted', handleWaitlistSubmit);
    
    return () => {
      window.removeEventListener('waitlistSubmitted', handleWaitlistSubmit);
    };
  }, []);

  useEffect(() => {
    // Check if mobile on mount and when window resizes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('/loop-header.lottie')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(error => console.error("Error loading Lottie animation:", error));
  }, []);

  useEffect(() => {
    // Skip effect on mobile
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageRef.current) return;
      
      const {
        left,
        top,
        width,
        height
      } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      imageRef.current.style.transform = `perspective(1000px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    
    const handleMouseLeave = () => {
      if (!imageRef.current) return;
      imageRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isMobile]);
  
  useEffect(() => {
    // Skip parallax on mobile
    if (isMobile) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elements = document.querySelectorAll('.parallax');
      elements.forEach(el => {
        const element = el as HTMLElement;
        const speed = parseFloat(element.dataset.speed || '0.1');
        const yPos = -scrollY * speed;
        element.style.setProperty('--parallax-y', `${yPos}px`);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);
  
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50" 
      id="home"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center min-h-[80vh] lg:min-h-0">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            {/* Modern badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-8 opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Portfolio on Autopilot</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Modern heading with better typography */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight opacity-0 animate-fade-in mb-6" 
              style={{ animationDelay: "0.3s" }}
            >
              <span className="block text-slate-900 mb-2">The Last Portfolio</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent font-extrabold">
                You'll Ever Need
              </span>
            </h1>
            
            {/* Enhanced subtitle */}
            <p 
              style={{ animationDelay: "0.5s" }} 
              className="text-lg sm:text-xl text-slate-600 leading-relaxed opacity-0 animate-fade-in mb-8 max-w-2xl"
            >
              Our AI builds and maintains your portfolio from your social profiles, so you never have to rebuild it again. 
              <span className="block mt-2 font-medium text-slate-700">Join thousands of professionals getting their free portfolio when we launch.</span>
            </p>
            
            {/* Modern CTA section */}
            <div 
              className="flex flex-col sm:flex-row gap-6 items-center lg:items-start opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.7s" }}
            >
              <div className="flex flex-col items-center lg:items-start gap-3">
                <a 
                  href="#waitlist-form" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('waitlist-form');
                  }}
                >
                  <span className="relative z-10">Join Waitlist - Get Free Portfolio</span>
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </a>
                
                {/* Enhanced waitlist count */}
                {!loading && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full border-2 border-white"></div>
                    </div>
                    <p className="text-sm font-medium">
                      <span className="text-indigo-600 font-bold">{(count + 50 + localIncrement).toLocaleString()}</span> people already joined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced visual section */}
          <div className="w-full lg:w-1/2 relative">
            {lottieData ? (
              <div className="relative z-10 animate-fade-in" style={{ animationDelay: "0.9s" }}>
                <div className="relative">
                  <LottieAnimation 
                    animationPath={lottieData as string} 
                    className="w-full h-auto max-w-2xl mx-auto"
                    loop={true}
                    autoplay={true}
                  />
                  {/* Decorative elements around animation */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-indigo-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-purple-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            ) : (
              <div className="relative animate-fade-in" style={{ animationDelay: "0.9s" }}>
                {/* Modern card container */}
                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/40">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      ref={imageRef} 
                      src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png" 
                      alt="Folyx Portfolio Builder Dashboard" 
                      className="w-full h-auto object-cover transition-transform duration-700 ease-out hover:scale-105" 
                      style={{ transformStyle: 'preserve-3d' }} 
                    />
                    {/* Overlay gradient for better integration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Floating UI elements */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-float">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Auto-updated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
