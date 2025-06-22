import React from "react";

// LinkedIn Icon Component
const LinkedInIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.456"/>
  </svg>
);

// Twitter Icon Component  
const TwitterIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 209" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M256 25.45c-9.42 4.177-19.542 7-30.166 8.27 10.845-6.5 19.172-16.793 23.093-29.057a105.183 105.183 0 0 1-33.351 12.745C205.995 7.201 192.346.822 177.239.822c-29.006 0-52.523 23.516-52.523 52.52 0 4.117.465 8.125 1.36 11.97-43.65-2.191-82.35-23.1-108.255-54.876-4.52 7.757-7.11 16.78-7.11 26.404 0 18.222 9.273 34.297 23.365 43.716a52.312 52.312 0 0 1-23.79-6.57c-.003.22-.003.44-.003.661 0 25.447 18.104 46.675 42.13 51.5a52.592 52.592 0 0 1-23.718.9c6.683 20.866 26.08 36.05 49.062 36.475-17.975 14.086-40.622 22.483-65.228 22.483-4.24 0-8.42-.249-12.529-.734 23.243 14.902 50.85 23.597 80.51 23.597 96.607 0 149.434-80.031 149.434-149.435 0-2.278-.05-4.543-.152-6.795A106.748 106.748 0 0 0 256 25.45"/>
  </svg>
);

// GitHub Icon Component
const GitHubIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 250" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.12-23.82-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.944.876-7.944 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 4.981-25.411 13.132-34.358-1.329-3.224-5.688-16.18 1.24-33.742 0 0 10.707-3.427 35.073 13.132 10.17-2.826 21.078-4.242 31.914-4.29 10.836.048 21.752 1.464 31.942 4.29 24.337-16.559 35.026-13.132 35.026-13.132 6.951 17.562 2.579 30.518 1.27 33.742 8.163 8.947 13.112 20.383 13.112 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.319 7.367 8.802 6.124C219.37 232.5 256 184.537 256 128.001 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"/>
  </svg>
);

// Medium Icon Component
const MediumIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 146" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M72.2 0c39.877 0 72.2 32.549 72.2 72.7 0 40.15-32.323 72.7-72.2 72.7S0 112.85 0 72.7C0 32.549 32.323 0 72.2 0ZM187.3 17.17c19.938 0 36.1 24.8 36.1 55.53 0 30.73-16.162 55.53-36.1 55.53s-36.1-24.8-36.1-55.53c0-30.73 16.162-55.53 36.1-55.53ZM238 32.68c7.03 0 12.73 19.89 12.73 44.42s-5.7 44.42-12.73 44.42c-7.03 0-12.73-19.89-12.73-44.42s5.7-44.42 12.73-44.42Z"/>
  </svg>
);

// Instagram Icon Component  
const InstagramIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"/>
  </svg>
);

// More Icon Component (showing additional integrations available)
const MoreIcon = () => (
  <svg 
    className="w-full h-full" 
    viewBox="0 0 256 256" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="64" cy="128" r="16"/>
    <circle cx="128" cy="128" r="16"/>
    <circle cx="192" cy="128" r="16"/>
    <circle cx="64" cy="64" r="12"/>
    <circle cx="128" cy="64" r="12"/>
    <circle cx="192" cy="64" r="12"/>
    <circle cx="64" cy="192" r="12"/>
    <circle cx="128" cy="192" r="12"/>
    <circle cx="192" cy="192" r="12"/>
  </svg>
);

const SpecsSection = () => {
  return (
    <section className="bg-white pt-8 pb-12 sm:pt-12 sm:pb-16" id="integrations">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="tech-chip mx-auto mb-3 sm:mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white mr-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </span>
            <span>Integrations</span>
          </div>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
            Connects to platforms <br className="hidden sm:block" />
            you already use
          </h2>
          <p className="section-subtitle text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
            Seamlessly sync your professional content from the platforms where you're already building your career.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {/* LinkedIn */}
          <div className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0077B5] group-hover:scale-110 transition-transform duration-300">
              <LinkedInIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">LinkedIn</span>
          </div>
          
          {/* Twitter */}
          <div className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#1DA1F2] group-hover:scale-110 transition-transform duration-300">
              <TwitterIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Twitter</span>
          </div>
          
          {/* GitHub */}
          <div className="bg-white border border-gray-200 hover:border-gray-400 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#333] group-hover:scale-110 transition-transform duration-300">
              <GitHubIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">GitHub</span>
          </div>
          
          {/* Medium */}
          <div className="bg-white border border-gray-200 hover:border-green-300 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#00AB6C] group-hover:scale-110 transition-transform duration-300">
              <MediumIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Medium</span>
          </div>
          
          {/* Instagram */}
          <div className="bg-white border border-gray-200 hover:border-pink-300 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#E4405F] group-hover:scale-110 transition-transform duration-300">
              <InstagramIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">Instagram</span>
          </div>
          
          {/* More */}
          <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center h-20 sm:h-24 md:h-28 lg:h-32 transition-all duration-300 hover:shadow-md group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-500 group-hover:scale-110 transition-transform duration-300">
              <MoreIcon />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2">More</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecsSection;
