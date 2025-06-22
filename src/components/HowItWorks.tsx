
import { Link, Wand2, Zap } from "lucide-react";

const steps = [
  {
    icon: Link,
    title: "Connect",
    description: "Securely link your LinkedIn, Twitter, and other professional profiles with one-click integration."
  },
  {
    icon: Wand2,
    title: "Generate",
    description: "Our AI instantly crafts a beautiful, personalized portfolio website from your data in under 60 seconds."
  },
  {
    icon: Zap,
    title: "Autopilot",
    description: "folyx.me continuously monitors your profiles, automatically updating your portfolio with new achievements and projects."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-gradient-to-r from-cyan-500/8 to-purple-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 tracking-tight text-white">
            How folyx.me Works in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light">
            From setup to live portfolio in minutes, not hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Enhanced connection lines for desktop */}
          <div className="hidden md:block absolute top-16 md:top-24 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center relative group"
            >
              {/* Enhanced step number */}
              <div className="absolute -top-4 md:-top-6 -left-4 md:-left-6 w-8 h-8 md:w-12 md:h-12 glass-card rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-bold text-white border border-white/10 shadow-2xl z-10">
                {index + 1}
              </div>
              
              <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-10 hover:scale-105 transition-all duration-500 border border-white/10 group-hover:border-white/20 premium-shadow h-full">
                <div className="w-16 h-16 md:w-20 md:h-20 glass-subtle rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
                  {step.description}
                </p>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl md:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Mobile connection arrow */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-8 mb-4">
                  <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced bottom section */}
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 glass-subtle rounded-full text-sm md:text-base text-zinc-300 border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 md:mr-3 animate-pulse"></span>
            Live in 5 minutes
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
