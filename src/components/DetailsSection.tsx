
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

const DetailsSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: ""
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

  const validateFullName = (name: string) => {
    const trimmedName = name.trim();
    
    // Check length
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return false;
    }
    
    // Check for repeated characters (more than 10 in a row)
    const repeatedCharPattern = /(.)\1{10,}/;
    if (repeatedCharPattern.test(trimmedName)) {
      return false;
    }
    
    // Check for suspicious special characters
    const specialCharPattern = /[{}[\]"\\]/;
    if (specialCharPattern.test(trimmedName)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced client-side validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!validateFullName(formData.fullName)) {
      toast.error("Please enter a valid full name (2-50 characters, no special symbols)");
      return;
    }

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

    if (formData.company && formData.company.length > 100) {
      toast.error("Company name is too long");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim() || null,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // Success
      toast.success("🎉 You're on the waitlist! We'll send you your free portfolio when it's ready!");
      
      // Mark as submitted and increment count
      setIsSubmitted(true);
      setLocalIncrement(1);
      
      // Save increment to localStorage for Hero component
      localStorage.setItem('waitlistIncrement', '1');
      
      // Dispatch custom event to notify Hero component
      window.dispatchEvent(new CustomEvent('waitlistSubmitted'));
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        company: ""
      });

    } catch (error: unknown) {
      console.error('Waitlist signup error:', error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already on our waitlist')) {
        toast.error("This email is already on our waitlist!");
      } else if (errorMessage.includes('valid email')) {
        toast.error("Please enter a valid email address");
      } else if (errorMessage.includes('valid full name')) {
        toast.error("Please enter a valid full name");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-started" className="w-full bg-white py-0">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {/* Left Card - Platform Features */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant">
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
            <div className="bg-white p-4 sm:p-8" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <h3 className="text-lg sm:text-xl font-display mb-6 sm:mb-8">
                Join the waitlist and get your professional portfolio for free when we launch
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

          {/* Right Card - Contact Form */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant" id="waitlist-form">
            {/* Card Header with background image instead of gradient */}
            <div className="relative h-32 sm:h-48 md:h-64 p-4 sm:p-6 md:p-8 flex flex-col items-start" style={{
              backgroundImage: "url('/background-section1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
              <div className="inline-block px-4 sm:px-6 py-2 border border-white text-white rounded-full text-xs mb-4">
                Join Waitlist
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display text-white font-bold mt-auto">
                Get your free portfolio when we launch
              </h2>
            </div>
            
            {/* Card Content - Form */}
            <div className="bg-white p-4 sm:p-8" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    placeholder="Full name" 
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
                    required 
                    disabled={isSubmitting || isSubmitted}
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="Email address" 
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
                    required 
                    disabled={isSubmitting || isSubmitted}
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <input 
                    type="text" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleChange} 
                    placeholder="Current role/company (optional)" 
                    className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" 
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
                    {isSubmitted ? "✓ You're on the waitlist!" : isSubmitting ? "Joining..." : "Join Waitlist"}
                  </button>
                  
                  {/* Waitlist count for FOMO */}
                  {!loading && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                      {(count + 50 + localIncrement).toLocaleString()} people waiting • Launching in 2 weeks
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
