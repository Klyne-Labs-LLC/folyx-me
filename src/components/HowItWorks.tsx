
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
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-white">
            How folyx.me Works in 3 Simple Steps
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            From setup to live portfolio in minutes, not hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-white/20 via-white/40 to-white/20"></div>
          
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center relative"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
