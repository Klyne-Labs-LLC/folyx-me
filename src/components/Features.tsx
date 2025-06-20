
import { Palette, Zap, Smartphone, Code, Users, Star } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Apple-Inspired Design",
    description: "Beautiful glassmorphism effects, smooth animations, and premium aesthetics that make your portfolio stand out."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create professional portfolios in minutes with our intuitive drag-and-drop builder and pre-made templates."
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Every portfolio looks perfect on all devices with responsive design and touch-friendly interactions."
  },
  {
    icon: Code,
    title: "No Code Required",
    description: "Build stunning portfolios without writing a single line of code. Focus on your content, not the technology."
  },
  {
    icon: Users,
    title: "Professional Templates",
    description: "Choose from dozens of professionally designed templates for different industries and career stages."
  },
  {
    icon: Star,
    title: "Premium Features",
    description: "Advanced customization, analytics, SEO optimization, and custom domains to elevate your online presence."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Everything you need to shine online
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help professionals create portfolios that convert visitors into opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`glass-card group hover:bg-white/20 transition-all duration-300 fade-in-up stagger-${index % 3 + 1}`}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
