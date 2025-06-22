
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-red-500/8 to-orange-500/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-green-500/8 to-blue-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight text-white">
            The Problem vs{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              The Solution
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
            Stop wrestling with outdated portfolios. There's a better way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-stretch">
          {/* Problem Section */}
          <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-12 border border-red-500/20 relative group order-1 lg:order-1">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl md:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 glass-subtle rounded-xl md:rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 md:mr-6 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">The Problem</h3>
            </div>
            
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-6 md:mb-8 font-light">
              Tired of manually updating your portfolio? It's time consuming, often neglected, 
              and leaves your professional story outdated.
            </p>
            
            <ul className="space-y-3 md:space-y-4 text-zinc-400">
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Hours spent on manual updates
              </li>
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Outdated information hurts opportunities
              </li>
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Design and coding complexity
              </li>
            </ul>
          </div>

          {/* Solution Section */}
          <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-12 border border-green-500/20 relative group order-2 lg:order-2">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl md:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 glass-subtle rounded-xl md:rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 md:mr-6 flex-shrink-0">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">The Solution</h3>
            </div>
            
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-6 md:mb-8 font-light">
              folyx.me solves this. Our intelligent platform connects directly to your professional 
              profiles, pulling in new data and updating your portfolio automatically.
            </p>
            
            <ul className="space-y-3 md:space-y-4 text-zinc-400 mb-6 md:mb-8">
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Automatic updates from LinkedIn & social media
              </li>
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Always current and impressive
              </li>
              <li className="flex items-center text-sm md:text-base">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 md:mr-4 flex-shrink-0"></div>
                Zero manual maintenance required
              </li>
            </ul>

            {/* Call to action for solution */}
            <div className="flex items-center text-green-400 hover:text-green-300 transition-colors cursor-pointer group/cta">
              <span className="text-sm md:text-base font-medium mr-2">See how it works</span>
              <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Connection arrow for desktop */}
        <div className="hidden lg:flex justify-center mt-8 relative">
          <div className="w-24 h-px bg-gradient-to-r from-red-400 via-white/20 to-green-400"></div>
          <ArrowRight className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white bg-zinc-900 rounded-full p-1" />
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
