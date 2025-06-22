
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced dark background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl floating"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center px-6 py-3 mb-12 glass-subtle rounded-full text-sm text-zinc-300 shadow-lg border border-white/10">
          <Sparkles className="w-4 h-4 mr-3 text-blue-400" />
          Portfolio on Autopilot
          <div className="ml-3 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs text-blue-300 border border-blue-500/20">
            NEW
          </div>
        </div>

        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 tracking-tight leading-none">
          <span className="text-white">Smart people are done</span>
          <br />
          <span className="text-zinc-500">with </span>
          <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
            outdated portfolios
          </span>
          <span className="text-zinc-500">,</span>
          <br />
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            they're on folyx
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-zinc-400 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
          Automatically pulls data from your LinkedIn, Twitter, and more to create a stunning, 
          always-current portfolio. Login, connect your socials, and get a live, personalized 
          website without any design or coding work.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Button size="lg" className="px-10 py-4 text-lg bg-white text-black hover:bg-zinc-100 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 border-0 rounded-xl font-semibold">
            Get Your Free Portfolio Now
            <ArrowRight className="ml-3 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-10 py-4 text-lg glass-subtle border-white/20 text-zinc-200 hover:bg-white/5 hover:border-white/30 rounded-xl font-medium">
            See Examples
          </Button>
        </div>

        {/* Enhanced hero visual */}
        <div className="mt-24">
          <div className="relative max-w-6xl mx-auto">
            <div className="glass-card rounded-3xl overflow-hidden premium-shadow-lg">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-900/50 to-black/50 flex items-center justify-center relative">
                {/* Enhanced browser window */}
                <div className="absolute top-8 left-8 flex space-x-4">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                </div>
                
                {/* Address bar */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 h-8 glass-subtle rounded-lg flex items-center px-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                  <span className="text-zinc-400 text-sm">folyx.me/yourname</span>
                </div>
                
                {/* Enhanced content preview */}
                <div className="text-center space-y-8 p-16">
                  <div className="w-24 h-24 mx-auto glass-card rounded-3xl flex items-center justify-center">
                    <Laptop className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 w-60 mx-auto glass-subtle rounded-xl"></div>
                    <div className="h-5 w-40 mx-auto glass-subtle rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mt-12">
                    <div className="h-32 glass-card rounded-2xl border border-white/5"></div>
                    <div className="h-32 glass-card rounded-2xl border border-white/5"></div>
                    <div className="h-32 glass-card rounded-2xl border border-white/5"></div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-20 right-20 w-16 h-16 glass-subtle rounded-2xl floating opacity-60"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 glass-subtle rounded-xl floating opacity-40" style={{animationDelay: '2s'}}></div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl transform scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
