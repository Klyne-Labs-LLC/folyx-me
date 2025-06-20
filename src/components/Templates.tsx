
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

const templates = [
  {
    name: "Creative Designer",
    category: "Design",
    preview: "Modern portfolio with glassmorphism cards and smooth animations",
    image: "photo-1488590528505-98d2b5aba04b",
    featured: true
  },
  {
    name: "Tech Professional",
    category: "Technology",
    preview: "Clean, minimalist design perfect for developers and engineers",
    image: "photo-1486312338219-ce68d2c6f44d",
    featured: false
  },
  {
    name: "Business Executive",
    category: "Business",
    preview: "Professional layout ideal for corporate professionals",
    image: "photo-1531297484001-80022131f5a1",
    featured: true
  },
  {
    name: "Creative Artist",
    category: "Art",
    preview: "Vibrant, expressive design for creative professionals",
    image: "photo-1460925895917-afdab827c52f",
    featured: false
  },
  {
    name: "Digital Marketer",
    category: "Marketing",
    preview: "Results-focused layout with analytics integration",
    image: "photo-1498050108023-c5249f4df085",
    featured: true
  },
  {
    name: "Consultant",
    category: "Consulting",
    preview: "Trustworthy design that builds client confidence",
    image: "photo-1483058712412-4245e9b90334",
    featured: false
  }
];

const Templates = () => {
  return (
    <section id="templates" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Beautiful templates for every profession
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a professionally designed template and customize it to match your unique style and brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div 
              key={template.name}
              className={`glass-card group hover:scale-105 transition-all duration-300 overflow-hidden fade-in-up stagger-${index % 3 + 1}`}
            >
              {template.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    Featured
                  </div>
                </div>
              )}
              
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl mb-4 overflow-hidden relative">
                <img 
                  src={`https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=800&q=80`}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {template.name}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  {template.preview}
                </p>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-primary/90 hover:bg-primary">
                    Use Template
                  </Button>
                  <Button size="sm" variant="outline" className="glass border-white/30">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="glass border-white/30">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="glass border-white/30 hover:bg-white/10">
            View All Templates
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Templates;
