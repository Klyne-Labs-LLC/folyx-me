
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gray-300 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 mb-8 backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-full text-sm text-gray-600 shadow-sm">
          <Sparkles className="w-4 h-4 mr-2 text-gray-400" />
          Professional portfolios made simple
        </div>

        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 tracking-tight text-gray-900 leading-none">
          Build stunning
          <br />
          <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            portfolios
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Create professional portfolio websites in minutes with our AI-powered platform. 
          No design skills required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="px-8 py-4 text-lg bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Start Building Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-4 text-lg backdrop-blur-xl bg-white/80 border-gray-200/50 text-gray-700 hover:bg-white/90">
            View Examples
          </Button>
        </div>

        {/* Hero visual */}
        <div className="mt-20">
          <div className="relative max-w-5xl mx-auto">
            <div className="backdrop-blur-xl bg-white/90 border border-gray-200/50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                {/* Mock browser window */}
                <div className="absolute top-6 left-6 flex space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                {/* Content preview */}
                <div className="text-center space-y-6 p-12">
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 w-48 mx-auto bg-gray-300 rounded-lg"></div>
                    <div className="h-4 w-32 mx-auto bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
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
