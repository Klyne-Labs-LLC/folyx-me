import React, { useEffect, useRef, useState } from "react";
import { cn, scrollToSection } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
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
      className="overflow-hidden relative min-h-screen flex items-center" 
      id="home"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: isMobile ? '120px 12px 60px' : '140px 20px 80px'
      }}
    >
      {/* Modern floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-300/15 rounded-full blur-2xl"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          <div className="w-full lg:w-1/2">
            {/* Modern badge */}
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 text-sm font-medium mb-6 opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              Portfolio on Autopilot
            </div>
            
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6 opacity-0 animate-fade-in" 
              style={{ 
                animationDelay: "0.3s",
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '800',
                letterSpacing: '-0.02em'
              }}
            >
              The Last Portfolio{" "}
              <br className="hidden sm:inline" />
              <span 
                className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
              >
                You'll Ever Need
              </span>
            </h1>
            
            <p 
              style={{ animationDelay: "0.5s" }} 
              className="text-xl text-white/80 leading-relaxed mb-8 max-w-2xl opacity-0 animate-fade-in"
            >
              Our AI builds and maintains your portfolio from your social profiles, so you never have to rebuild it again. Join thousands of professionals getting their free portfolio when we launch.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.7s" }}
            >
              <div className="flex flex-col items-start gap-3">
                <a 
                  href="#waitlist-form" 
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-50" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('waitlist-form');
                  }}
                >
                  Join Waitlist - Get Free Portfolio
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                
                {!loading && (
                  <p className="text-white/70 text-sm font-medium">
                    {(count + 50 + localIncrement).toLocaleString()} people already joined
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
            {lottieData ? (
              <div className="relative z-10 animate-fade-in" style={{ animationDelay: "0.9s" }}>
                <LottieAnimation 
                  animationPath={lottieData as string} 
                  className="w-full h-auto max-w-lg mx-auto"
                  loop={true}
                  autoplay={true}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 -z-10 shadow-2xl"></div>
                <div className="relative transition-all duration-500 ease-out overflow-hidden rounded-3xl shadow-2xl">
                  <img 
                    ref={imageRef} 
                    src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png" 
                    alt="Folyx Portfolio Builder Dashboard" 
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out" 
                    style={{ transformStyle: 'preserve-3d' }} 
                  />
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
