
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about putting your portfolio on autopilot.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
