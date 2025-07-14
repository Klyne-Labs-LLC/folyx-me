import React from "react";

/**
 * HowItWorksDemo Component
 * 
 * This component showcases how Folyx works through an embedded demo video.
 * It provides users with a visual understanding of the platform's capabilities
 * and workflow before they dive deeper into the features.
 */
const HowItWorksDemo = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 animate-on-scroll">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            See How <span className="text-blue-600">Folyx</span> Works
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Watch our demo to see how Folyx transforms your professional data into 
            stunning portfolios in minutes, not hours.
          </p>
        </div>

        {/* Video Container */}
        <div className="animate-on-scroll">
          <div className="relative mx-auto max-w-4xl">
            {/* Video Wrapper with responsive aspect ratio */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl border border-gray-200"
                src="https://www.youtube.com/embed/ai5nhXeW2lU?rel=0&modestbranding=1&showinfo=0"
                title="How Folyx Works - Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            
            {/* Video Overlay Gradient (subtle enhancement) */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Additional Context Below Video */}
        <div className="text-center mt-12 animate-on-scroll">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Feature Highlight 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Generate professional portfolios in under 5 minutes</p>
            </div>

            {/* Feature Highlight 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Smart content generation from your existing profiles</p>
            </div>

            {/* Feature Highlight 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600 text-sm">Beautiful, responsive designs that impress employers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksDemo; 