
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl floating" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <div className="fade-in-up">
          <div className="inline-flex items-center px-4 py-2 mb-8 glass-card text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Introducing the future of portfolio creation
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 fade-in-up stagger-1">
          Create <span className="gradient-text">stunning</span> portfolios
          <br />
          in minutes, not hours
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto fade-in-up stagger-2">
          Professional portfolio websites with Apple-inspired design, 
          glassmorphism effects, and seamless animations. No coding required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up stagger-3">
          <Button size="lg" className="text-lg px-8 py-4 apple-shadow hover:scale-105 transition-all duration-300 bg-primary/90 hover:bg-primary backdrop-blur-sm border border-white/20">
            Start Building Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4 glass border-white/30 hover:bg-white/10">
            View Examples
          </Button>
        </div>

        {/* Hero visual */}
        <div className="mt-20 fade-in-up stagger-4">
          <div className="relative max-w-5xl mx-auto">
            <div className="glass-card apple-shadow pulse-glow">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <div className="text-2xl text-muted-foreground">
                  ✨ Portfolio Preview ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
