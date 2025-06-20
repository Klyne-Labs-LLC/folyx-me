
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl floating" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card apple-shadow pulse-glow">
          <div className="p-12">
            <div className="flex items-center justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
              Ready to create your stunning portfolio?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have elevated their online presence with our platform. 
              Start building your dream portfolio today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4 apple-shadow hover:scale-105 transition-all duration-300 bg-primary/90 hover:bg-primary backdrop-blur-sm border border-white/20">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
