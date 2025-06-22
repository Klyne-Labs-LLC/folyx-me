
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Sparkles, Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center">
      {/* Enhanced dark background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 md:top-20 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl floating"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-10 w-16 h-16 md:w-20 md:h-20 border border-white/10 rounded-2xl rotate-12 floating opacity-30"></div>
        <div className="absolute bottom-32 left-10 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full floating opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg rotate-45 floating opacity-50" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Enhanced badge */}
        <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 mb-8 md:mb-12 glass-subtle rounded-full text-xs md:text-sm text-zinc-300 shadow-lg border border-white/10 hover:scale-105 transition-transform duration-300">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-blue-400" />
          Portfolio on Autopilot
          <div className="ml-2 md:ml-3 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs text-blue-300 border border-blue-500/20">
            NEW
          </div>
        </div>

        {/* Enhanced typography with better mobile scaling */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 tracking-tight leading-[1.1] md:leading-none">
          <span className="text-white block">Smart people are done</span>
          <span className="text-zinc-500 inline md:block">with </span>
          <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent inline md:block">
            outdated portfolios
          </span>
          <span className="text-zinc-500">,</span>
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent block mt-2 md:mt-0">
            they're on folyx
          </span>
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 mb-12 md:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-4">
          Automatically pulls data from your LinkedIn, Twitter, and more to create a stunning, 
          always-current portfolio. Login, connect your socials, and get a live, personalized 
          website without any design or coding work.
        </p>

        {/* Enhanced CTA buttons with better mobile layout */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-16 md:mb-20 px-4">
          <Button size="lg" className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 text-base md:text-lg bg-white text-black hover:bg-zinc-100 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 border-0 rounded-xl font-semibold group">
            Get Your Free Portfolio Now
            <ArrowRight className="ml-2 md:ml-3 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 text-base md:text-lg glass-subtle border-white/20 text-zinc-200 hover:bg-white/5 hover:border-white/30 rounded-xl font-medium">
            See Examples
          </Button>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 mb-16 md:mb-24 text-sm text-zinc-400 px-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>Loved by 10,000+ professionals</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20"></div>
          <span>Setup in under 5 minutes</span>
        </div>

        {/* Enhanced hero visual with better mobile responsiveness */}
        <div className="mt-12 md:mt-24">
          <div className="relative max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden premium-shadow-lg hover:scale-[1.02] transition-transform duration-700">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-900/50 to-black/50 flex items-center justify-center relative">
                {/* Browser window */}
                <div className="absolute top-4 md:top-8 left-4 md:left-8 flex space-x-2 md:space-x-4">
                  <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-red-500 shadow-lg"></div>
                  <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                  <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-green-500 shadow-lg"></div>
                </div>
                
                {/* Address bar */}
                <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 md:w-80 h-6 md:h-8 glass-subtle rounded-lg flex items-center px-3 md:px-4">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-400 mr-2 md:mr-3"></div>
                  <span className="text-zinc-400 text-xs md:text-sm">folyx.me/yourname</span>
                </div>
                
                {/* Content preview with better mobile scaling */}
                <div className="text-center space-y-4 md:space-y-8 p-8 md:p-16">
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto glass-card rounded-2xl md:rounded-3xl flex items-center justify-center">
                    <Laptop className="w-6 h-6 md:w-10 md:h-10 text-blue-400" />
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <div className="h-4 md:h-8 w-40 sm:w-48 md:w-60 mx-auto glass-subtle rounded-lg md:rounded-xl"></div>
                    <div className="h-3 md:h-5 w-24 sm:w-32 md:w-40 mx-auto glass-subtle rounded-md md:rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-12">
                    <div className="h-16 md:h-32 glass-card rounded-xl md:rounded-2xl border border-white/5"></div>
                    <div className="h-16 md:h-32 glass-card rounded-xl md:rounded-2xl border border-white/5"></div>
                    <div className="h-16 md:h-32 glass-card rounded-xl md:rounded-2xl border border-white/5"></div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-12 md:top-20 right-12 md:right-20 w-8 h-8 md:w-16 md:h-16 glass-subtle rounded-xl md:rounded-2xl floating opacity-60"></div>
                <div className="absolute bottom-12 md:bottom-20 left-12 md:left-20 w-6 h-6 md:w-12 md:h-12 glass-subtle rounded-lg md:rounded-xl floating opacity-40" style={{animationDelay: '2s'}}></div>
              </div>
            </div>

            {/* Enhanced glow effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl md:rounded-3xl blur-3xl transform scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
