
import { Link, Wand2, Zap } from "lucide-react";

const steps = [
  {
    icon: Link,
    title: "Connect",
    description: "Securely link your LinkedIn, Twitter, and other professional profiles."
  },
  {
    icon: Wand2,
    title: "Generate",
    description: "Our AI instantly crafts a beautiful, personalized portfolio website from your data."
  },
  {
    icon: Zap,
    title: "Autopilot",
    description: "folyx.me continuously monitors your profiles, automatically updating your portfolio with new achievements and projects."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-32 px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/8 to-purple-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-white">
            How folyx.me Works in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-2xl text-zinc-400 max-w-3xl mx-auto font-light">
            From setup to live portfolio in minutes, not hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Enhanced connection lines */}
          <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center relative group"
            >
              {/* Enhanced step number */}
              <div className="absolute -top-6 -left-6 w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-lg font-bold text-white border border-white/10 shadow-2xl">
                {index + 1}
              </div>
              
              <div className="glass-card rounded-3xl p-10 hover:scale-105 transition-all duration-500 border border-white/10 group-hover:border-white/20 premium-shadow">
                <div className="w-20 h-20 glass-subtle rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-white">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
