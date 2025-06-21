
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl floating" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl floating" style={{animationDelay: '6s'}}></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 mb-8 card-floating rounded-full text-sm text-slate-300 shadow-sm">
          <Laptop className="w-4 h-4 mr-2 text-slate-400" />
          Nice templates
        </div>

        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 tracking-tight text-slate-100 leading-none">
          Smart people are done
          <br />
          with <span className="text-slate-400">outdated portfolios</span>,
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-slate-200 to-blue-400 bg-clip-text text-transparent">
            they're on folyx
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Create professional portfolio websites in minutes with our AI-powered platform. 
          No design skills required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="px-8 py-4 text-lg bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Start Building Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-4 text-lg card-floating border-slate-600 text-slate-300 hover:bg-slate-700/30">
            View Examples
          </Button>
        </div>

        {/* Hero visual */}
        <div className="mt-20">
          <div className="relative max-w-5xl mx-auto">
            <div className="card-floating rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                {/* Mock browser window */}
                <div className="absolute top-6 left-6 flex space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                {/* Content preview */}
                <div className="text-center space-y-6 p-12">
                  <div className="w-20 h-20 mx-auto bg-slate-700 rounded-2xl flex items-center justify-center">
                    <Laptop className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 w-48 mx-auto bg-slate-600 rounded-lg"></div>
                    <div className="h-4 w-32 mx-auto bg-slate-700 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-24 bg-slate-700 rounded-xl"></div>
                    <div className="h-24 bg-slate-700 rounded-xl"></div>
                    <div className="h-24 bg-slate-700 rounded-xl"></div>
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
