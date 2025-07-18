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
      className="overflow-hidden relative bg-cover" 
      id="home" 
      style={{
        backgroundImage: 'url("/Header-background.webp")',
        backgroundPosition: 'center 30%', 
        padding: isMobile ? '100px 12px 40px' : '120px 20px 60px'
      }}
    >
      <div className="absolute -top-[10%] -right-[5%] w-1/2 h-[70%] bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-30 blur-3xl rounded-full"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <div 
              className="tech-chip mb-3 sm:mb-6 opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.1s" }}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white mr-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
              <span>Portfolio on Autopilot</span>
            </div>
            
            <h1 
              className="section-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.3s" }}
            >
              <span className="text-gray-900">The Last Portfolio</span> <br className="hidden sm:inline" />
              <span 
                className="font-semibold" 
                style={{ 
                  color: '#b82db1',
                  textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 2px 2px 4px rgba(0,0,0,0.1)' 
                }}
              >
                You'll Ever Need to Build
              </span>
            </h1>
            
            <p 
              style={{ animationDelay: "0.5s" }} 
              className="section-subtitle mt-3 sm:mt-6 mb-4 sm:mb-8 leading-relaxed opacity-0 animate-fade-in text-gray-700 font-normal text-sm sm:text-base md:text-lg text-left"
            >
              Our AI builds and maintains your portfolio from your social profiles, so you never have to rebuild it again. Join thousands of professionals getting their free portfolio when we launch.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 items-center sm:items-start opacity-0 animate-fade-in" 
              style={{ animationDelay: "0.7s" }}
            >
              {/* Get Started Button with People Count */}
              <div className="flex flex-col items-center gap-2">
                <a 
                  href="https://app.folyx.me" 
                  className="flex items-center justify-center group w-full sm:w-auto text-center" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
                    borderRadius: '1440px',
                    boxSizing: 'border-box',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '20px',
                    padding: '16px 24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Get Started - Create Your Portfolio
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                
                {/* FOMO messaging - below Get Started button */}
                {!loading && (
                  <p className="text-sm text-gray-600 font-medium text-center">
                    {(count + 174 + localIncrement).toLocaleString()} professionals already joined
                  </p>
                )}
              </div>
              
              {/* Watch Demo Button */}
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="flex items-center justify-center group w-full sm:w-auto text-center border-2 border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-600 transition-all duration-200 bg-white hover:bg-purple-50"
                style={{
                  borderRadius: '1440px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  lineHeight: '20px',
                  padding: '14px 22px',
                }}
              >
                <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch How It Works
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative mt-6 lg:mt-0">
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
              <>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-orange-900 rounded-2xl sm:rounded-3xl -z-10 shadow-xl"></div>
              <div className="relative transition-all duration-500 ease-out overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                <img 
                  ref={imageRef} 
                  src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png" 
                  alt="Folyx Portfolio Builder Dashboard" 
                  className="w-full h-auto object-cover transition-transform duration-500 ease-out" 
                  style={{ transformStyle: 'preserve-3d' }} 
                />
                <div className="absolute inset-0" style={{ backgroundImage: 'url("/hero-image.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay', opacity: 0.3 }}></div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block absolute bottom-0 left-1/4 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -z-10 parallax" data-speed="0.05"></div>
    </section>
  );
};

export default Hero;
