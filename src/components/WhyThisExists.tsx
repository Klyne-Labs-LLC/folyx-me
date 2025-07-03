
import React, { useEffect, useRef } from "react";

const WhyThisExists = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white" id="why-this-exists" ref={sectionRef}>
      <div className="section-container opacity-0">
        <div className="max-w-4xl mx-auto">
          <div className="tech-chip mx-auto mb-6 text-center">
            <span>The Brutal Truth</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
            Why I Built This (And Why You Need It)
          </h2>
          
          <div className="prose prose-lg mx-auto text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              <strong>I've been on both sides of this problem.</strong> As a developer, I watched talented engineers get passed over because their online presence looked like amateur hour. As someone who's hired developers, I've seen incredible GitHub profiles attached to LinkedIn pages that looked like they were written by a bot.
            </p>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6">
              <p className="text-red-800 font-medium mb-2">Here's what's actually happening in hiring:</p>
              <ul className="text-red-700 space-y-2">
                <li>• 78% of technical recruiters spend less than 30 seconds on your initial online evaluation</li>
                <li>• Engineers with polished portfolios get 3.2x more interview requests</li>
                <li>• 43% of hiring managers reject candidates before looking at their code - just based on presentation</li>
              </ul>
            </div>
            
            <p className="text-lg leading-relaxed mb-6">
              <strong>The problem isn't your skills.</strong> You can build distributed systems, optimize database queries, and architect scalable applications. But you're losing opportunities to developers who simply present themselves better online.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              I got tired of watching great engineers get overlooked while mediocre ones with better marketing got the jobs. So I built what I wished existed: <strong>AI that understands your technical work and presents it the way a senior engineer would.</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 font-medium">
                This isn't about fake it 'til you make it. This is about finally showing your real value in a way that hiring managers actually understand and respect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyThisExists;
