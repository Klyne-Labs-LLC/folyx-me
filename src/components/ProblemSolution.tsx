
import { AlertTriangle, CheckCircle } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-32 px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/8 to-orange-500/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/8 to-blue-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem Section */}
          <div className="glass-card rounded-3xl p-12 border border-red-500/20 relative group">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 glass-subtle rounded-2xl flex items-center justify-center mr-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">The Problem</h3>
            </div>
            
            <p className="text-xl text-zinc-400 leading-relaxed mb-8 font-light">
              Tired of manually updating your portfolio? It's time consuming, often neglected, 
              and leaves your professional story outdated.
            </p>
            
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-4"></div>
                Hours spent on manual updates
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-4"></div>
                Outdated information hurts opportunities
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-4"></div>
                Design and coding complexity
              </li>
            </ul>
          </div>

          {/* Solution Section */}
          <div className="glass-card rounded-3xl p-12 border border-green-500/20 relative group">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 glass-subtle rounded-2xl flex items-center justify-center mr-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">The Solution</h3>
            </div>
            
            <p className="text-xl text-zinc-400 leading-relaxed mb-8 font-light">
              folyx.me solves this. Our intelligent platform connects directly to your professional 
              profiles, pulling in new data and updating your portfolio automatically.
            </p>
            
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                Automatic updates from LinkedIn & social media
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                Always current and impressive
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                Zero manual maintenance required
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
