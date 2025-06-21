
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
    <section className="py-24 px-6 lg:px-8 bg-gradient-to-b from-transparent to-zinc-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-white">
            What Devs Are Saying
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Join thousands of developers who've automated their personal brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <img 
                  src={`https://images.unsplash.com/${testimonial.image}?auto=format&fit=crop&w=150&q=80`}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-zinc-400 text-sm">{testimonial.profession}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
