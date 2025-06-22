
const testimonials = [
  {
    quote: "folyx.me is a game-changer! My portfolio syncs automatically with my GitHub and LinkedIn. I ship features, it ships updates. Perfect.",
    name: "Alex Chen",
    profession: "Full-Stack Developer",
    image: "photo-1507003211169-0a1dd7228f2d"
  },
  {
    quote: "Finally, a portfolio that gets the dev workflow. Push to main, portfolio updates. No more manual labor on personal branding.",
    name: "Jordan Rivera",
    profession: "DevOps Engineer", 
    image: "photo-1494790108755-2616b612b1c3"
  },
  {
    quote: "As a remote dev, my online presence is everything. folyx.me keeps my portfolio fresh while I focus on what I do best - building products.",
    name: "Taylor Kim",
    profession: "React Developer",
    image: "photo-1472099645785-5658abf4ff4e"
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-white">
            What{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Devs
            </span>{" "}
            Are Saying
          </h2>
          <p className="text-2xl text-zinc-400 max-w-3xl mx-auto font-light">
            Join thousands of developers who've automated their personal brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="glass-card rounded-3xl p-10 hover:scale-105 transition-all duration-500 border border-white/10 hover:border-white/20 premium-shadow group"
            >
              <div className="mb-8">
                <div className="flex text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-xl leading-relaxed italic font-light">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img 
                    src={`https://images.unsplash.com/${testimonial.image}?auto=format&fit=crop&w=150&q=80`}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-zinc-400 text-sm">{testimonial.profession}</p>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
