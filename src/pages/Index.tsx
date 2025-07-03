import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyThisExists from "@/components/WhyThisExists";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import HumanoidSection from "@/components/HumanoidSection";
import SpecsSection from "@/components/SpecsSection";
import DetailsSection from "@/components/DetailsSection";
import CTA from "@/components/CTA";
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
      <main className="space-y-4 sm:space-y-8">
        {/* Hero Section - Problem-focused landing */}
        <Hero />
        
        {/* Why This Exists - Credibility and problem amplification */}
        <WhyThisExists />
        
        {/* Features Section - Solution with specific outcomes */}
        <Features />
        
        {/* How It Works - Technical process for engineers */}
        <HowItWorks />
        
        {/* Why AI Section - Keep existing content */}
        <HumanoidSection />
        
        {/* Integrations Section - Platform connections */}
        <SpecsSection />
        
        {/* CTA Section - Direct response close */}
        <CTA />
        
        {/* Get Started Section - Waitlist form */}
        <DetailsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
