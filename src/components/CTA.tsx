
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles, Users, Clock, Shield } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-64 md:w-96 h-64 md:h-96 bg-white/[0.02] rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-0 right-1/3 w-48 md:w-80 h-48 md:h-80 bg-white/[0.01] rounded-full blur-3xl floating" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 md:w-[600px] h-96 md:h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="glass premium-shadow-lg rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
          {/* Floating elements */}
          <div className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20 glass-subtle rounded-2xl flex items-center justify-center opacity-20 floating">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          </div>
          
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 mb-6 md:mb-8 glass-subtle rounded-full text-xs md:text-sm text-zinc-300 border border-white/10">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-2 text-green-400" />
              Join 10,000+ professionals
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-white">
              Ready to build your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                portfolio?
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who have elevated their careers with stunning, 
              always-current portfolios that work on autopilot.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12">
              <Button size="lg" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg premium-shadow-lg hover:scale-105 transition-all duration-300 bg-white text-black hover:bg-zinc-200 group">
                Start Building for Free
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg glass-subtle border-white/20 text-zinc-200 hover:bg-white/5 hover:border-white/30">
                See Live Examples
              </Button>
            </div>

            {/* Enhanced features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm text-zinc-400 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 md:p-4 glass-subtle rounded-lg md:rounded-xl border border-white/5">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-center sm:text-left">No credit card required</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 md:p-4 glass-subtle rounded-lg md:rounded-xl border border-white/5">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-center sm:text-left">5-minute setup</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 md:p-4 glass-subtle rounded-lg md:rounded-xl border border-white/5">
                <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-center sm:text-left">Enterprise security</span>
              </div>
            </div>

            {/* Social proof */}
            <div className="text-center">
              <p className="text-zinc-500 text-xs md:text-sm mb-2">
                Trusted by professionals at
              </p>
              <div className="flex justify-center items-center gap-4 md:gap-8 opacity-50">
                <div className="text-zinc-600 font-semibold text-xs md:text-sm">Google</div>
                <div className="text-zinc-600 font-semibold text-xs md:text-sm">Microsoft</div>
                <div className="text-zinc-600 font-semibold text-xs md:text-sm">Apple</div>
                <div className="text-zinc-600 font-semibold text-xs md:text-sm">Meta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
