
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does folyx.me keep my portfolio updated?",
    answer: "Our AI continuously monitors your connected social media profiles and professional platforms like LinkedIn. When you post new achievements, projects, or updates, our system automatically pulls this information and updates your portfolio in real-time."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use enterprise-grade security measures and only access publicly available information from your profiles. We never store your login credentials and you can disconnect any platform at any time."
  },
  {
    question: "Can I customize my portfolio design?",
    answer: "Yes! While our AI creates a beautiful initial design, you can customize colors, layouts, and content to match your personal brand. Our platform offers multiple themes and customization options."
  },
  {
    question: "What platforms do you integrate with?",
    answer: "Currently, we integrate with LinkedIn, Twitter, and GitHub. We're continuously adding new platforms based on user feedback. Instagram, Behance, and Dribbble integrations are coming soon."
  },
  {
    question: "Is there really a free tier?",
    answer: "Yes! Our free tier includes a fully functional portfolio with automatic updates from one platform. No credit card required, no hidden fees. You can upgrade anytime for additional features and integrations."
  },
  {
    question: "How quickly can I get my portfolio live?",
    answer: "Most users have their portfolio live within 5 minutes of signing up. Simply connect your LinkedIn account, and our AI will generate your professional portfolio instantly."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-white">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about putting your portfolio on autopilot.
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="group"
            >
              <div className="glass-card border border-white/10 rounded-xl md:rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200 group"
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white pr-4 leading-relaxed">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full glass-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                    ) : (
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                    )}
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 sm:px-6 md:px-8 pb-4 md:pb-6">
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-zinc-400 leading-relaxed text-sm md:text-base mt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-zinc-400 mb-4 text-sm md:text-base">
            Still have questions?
          </p>
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm md:text-base transition-colors duration-200 hover:underline">
            Contact our support team
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
