import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HumanoidSection from "@/components/HumanoidSection";
import SpecsSection from "@/components/SpecsSection";
import DetailsSection from "@/components/DetailsSection";
import Footer from "@/components/Footer";

const Index = () => {
  // Initialize intersection observer for animations
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
    
    // Observe elements with animation class
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="space-y-2 sm:space-y-4">
        {/* Hero Section - Main landing area */}
        <Hero />
        
        {/* Why AI Section - Benefits and features */}
        <HumanoidSection />
        
        {/* Integrations Section - Platform connections */}
        <SpecsSection />
        
        {/* Get Started Section - CTA and form */}
        <DetailsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
