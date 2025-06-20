
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-foreground/[0.015] rounded-full blur-3xl floating" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="fade-in-up">
          <div className="inline-flex items-center px-4 py-2 mb-8 glass-subtle rounded-full text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Professional portfolios made simple
          </div>
        </div>

        <h1 className="text-display mb-6 fade-in-up stagger-1">
          Beautiful portfolios
          <br />
          for every professional
        </h1>

        <p className="text-hero text-muted-foreground mb-12 max-w-2xl mx-auto fade-in-up stagger-2">
          Create stunning portfolio websites in minutes with our premium templates. 
          No design skills required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up stagger-3">
          <Button size="lg" className="px-8 py-3 premium-shadow-lg hover:scale-105 transition-all duration-300">
            Start Building
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3 glass-subtle border-border/50 hover:bg-accent/50">
            View Examples
          </Button>
        </div>

        {/* Hero visual */}
        <div className="mt-20 fade-in-up stagger-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="glass premium-shadow-lg rounded-2xl overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-accent to-muted/50 flex items-center justify-center relative">
                {/* Mock browser window */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                </div>
                
                {/* Content preview */}
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 mx-auto bg-foreground/10 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 mx-auto bg-foreground/10 rounded"></div>
                    <div className="h-3 w-24 mx-auto bg-foreground/5 rounded"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="h-20 bg-foreground/5 rounded-lg"></div>
                    <div className="h-20 bg-foreground/5 rounded-lg"></div>
                    <div className="h-20 bg-foreground/5 rounded-lg"></div>
                  </div>
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
