
import { Palette, Zap, Smartphone, Code, Users, Shield } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Premium Design",
    description: "Carefully crafted templates with attention to every detail, typography, and spacing."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Build professional portfolios in minutes with our intuitive drag-and-drop interface."
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Every portfolio looks perfect on all devices with responsive design principles."
  },
  {
    icon: Code,
    title: "No Code Required",
    description: "Focus on your content and let us handle the technical complexity behind the scenes."
  },
  {
    icon: Users,
    title: "Built for Professionals",
    description: "Templates designed specifically for different industries and career stages."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee for your portfolio."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Everything you need to stand out
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional tools and premium templates to create portfolios that make lasting impressions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`group p-8 glass-subtle rounded-3xl hover:scale-105 transition-all duration-300 fade-in-up stagger-${(index % 3) + 1}`}
            >
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
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
