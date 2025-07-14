
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const DetailsSection = () => {
  const [formData, setFormData] = useState({
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localIncrement, setLocalIncrement] = useState(0);
  const { count, loading } = useWaitlistCount();

  useEffect(() => {
    // Clear any stored increment on page load/refresh since DB count will now include it
    localStorage.removeItem('waitlistIncrement');
    setLocalIncrement(0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced client-side validation
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check for suspicious email patterns
    const email = formData.email.trim().toLowerCase();
    const suspiciousEmailPatterns = [
      /^null@/,
      /test@test/,
      /sample@/,
      /^\d+@/,
      /@null\./,
      /@test\./
    ];

    if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll simulate a newsletter signup
      // In a real implementation, you'd call your newsletter API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      toast.success("🎉 Thanks for subscribing! You'll receive our latest updates and portfolio tips.");
      
      // Mark as submitted and increment count
      setIsSubmitted(true);
      setLocalIncrement(1);
      
      // Save increment to localStorage for Hero component
      localStorage.setItem('waitlistIncrement', '1');
      
      // Dispatch custom event to notify Hero component
      window.dispatchEvent(new CustomEvent('waitlistSubmitted'));
      
      // Reset form
      setFormData({
        email: ""
      });

    } catch (error: unknown) {
      console.error('Newsletter signup error:', error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already subscribed')) {
        toast.error("This email is already subscribed to our newsletter!");
      } else if (errorMessage.includes('valid email')) {
        toast.error("Please enter a valid email address");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-started" className="w-full bg-white py-8 sm:py-12">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Left Card - Platform Features */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant h-full flex flex-col">
            {/* Card Header with background image instead of gradient */}
            <div className="relative h-32 sm:h-48 md:h-64 p-4 sm:p-6 md:p-8 flex items-end" style={{
              backgroundImage: "url('/background-section3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display text-white font-bold">
                Platform Features
              </h2>
            </div>
            
            {/* Card Content */}
            <div className="bg-white p-4 sm:p-8 flex-1 flex flex-col justify-center" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <h3 className="text-lg sm:text-xl font-display mb-6 sm:mb-8">
                Join thousands of professionals who've already transformed their careers
              </h3>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-100">
                      <span className="font-semibold text-base">Setup Time:</span> Under 5 minutes
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-100">
                      <span className="font-semibold text-base">Templates:</span> 50+ Professional Designs
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-100">
                      <span className="font-semibold text-base">Integrations:</span> 15+ Platforms
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-100">
                      <span className="font-semibold text-base">Updates:</span> Real-time Auto Sync
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Newsletter Form */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant h-full flex flex-col" id="newsletter">
            {/* Card Header with background image instead of gradient */}
            <div className="relative h-32 sm:h-48 md:h-64 p-4 sm:p-6 md:p-8 flex flex-col items-start" style={{
              backgroundImage: "url('/background-section1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
              <div className="inline-block px-4 sm:px-6 py-2 border border-white text-white rounded-full text-xs mb-4">
                Newsletter
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-white font-bold mt-auto">
                Don't miss out on career-boosting insights
              </h2>
            </div>
            
            {/* Card Content - Form */}
            <div className="bg-white p-4 sm:p-8 flex-1 flex flex-col justify-center" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Join our exclusive community of high-achieving professionals and get insider strategies delivered weekly.
                </p>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">What you'll receive:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Weekly portfolio design tips and best practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Career advancement strategies from industry experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>New AI tools and features to boost your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Success stories from professionals like you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Early access to premium templates and features</span>
                  </li>
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="Enter your email address" 
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
                    required 
                    disabled={isSubmitting || isSubmitted}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || isSubmitted}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitted ? "✓ Subscribed!" : isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
                  </button>
                  
                  <p className="text-center text-xs text-gray-500 mt-2">
                    No spam, unsubscribe anytime. Join career-focused professionals.
                  </p>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
