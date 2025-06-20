
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle dark background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 mb-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full text-sm text-zinc-400 shadow-sm">
          <Sparkles className="w-4 h-4 mr-2 text-zinc-500" />
          Professional portfolios made simple
        </div>

        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 tracking-tight text-white leading-none">
          Build stunning
          <br />
          <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
            portfolios
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Create professional portfolio websites in minutes with our AI-powered platform. 
          No design skills required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="px-8 py-4 text-lg bg-white text-black hover:bg-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Start Building Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-4 text-lg backdrop-blur-xl bg-white/5 border-white/20 text-zinc-300 hover:bg-white/10">
            View Examples
          </Button>
        </div>

        {/* Hero visual */}
        <div className="mt-20">
          <div className="relative max-w-5xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center relative">
                {/* Mock browser window */}
                <div className="absolute top-6 left-6 flex space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                {/* Content preview */}
                <div className="text-center space-y-6 p-12">
                  <div className="w-20 h-20 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-zinc-600 rounded-lg"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 w-48 mx-auto bg-zinc-700 rounded-lg"></div>
                    <div className="h-4 w-32 mx-auto bg-zinc-800 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-24 bg-zinc-800 rounded-xl"></div>
                    <div className="h-24 bg-zinc-800 rounded-xl"></div>
                    <div className="h-24 bg-zinc-800 rounded-xl"></div>
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
