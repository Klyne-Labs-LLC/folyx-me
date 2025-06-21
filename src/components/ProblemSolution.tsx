
import { AlertTriangle, CheckCircle } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-24 px-6 lg:px-8 bg-gradient-to-b from-transparent to-zinc-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl font-bold text-white">The Problem</h3>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-300 leading-tight">
              Tired of manually updating your portfolio?
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              It's time consuming, often neglected, and leaves your professional story outdated. 
              While you're busy advancing your career, your online presence falls behind.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Hours spent on manual updates</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Outdated achievements and projects</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Missed opportunities from stale portfolios</span>
              </div>
            </div>
          </div>

          {/* Solution */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">The Solution</h3>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              folyx.me solves this.
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Our intelligent platform connects directly to your professional profiles, pulling in new data 
              and updating your portfolio automatically. Your online presence stays fresh, relevant, and 
              impressive, without you lifting a finger.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Automatic updates from LinkedIn & social media</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI-powered portfolio generation</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Always current, always professional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
