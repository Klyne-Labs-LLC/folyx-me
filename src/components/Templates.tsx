
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

const templates = [
  {
    name: "Minimal Creative",
    category: "Design",
    preview: "Clean and focused design for creative professionals",
    image: "photo-1488590528505-98d2b5aba04b",
    featured: true
  },
  {
    name: "Tech Professional",
    category: "Technology",
    preview: "Modern layout perfect for developers and engineers",
    image: "photo-1486312338219-ce68d2c6f44d",
    featured: false
  },
  {
    name: "Business Executive",
    category: "Business",
    preview: "Professional layout for corporate leaders",
    image: "photo-1531297484001-80022131f5a1",
    featured: true
  },
  {
    name: "Creative Artist",
    category: "Art",
    preview: "Expressive design showcasing creative work",
    image: "photo-1460925895917-afdab827c52f",
    featured: false
  },
  {
    name: "Digital Marketer",
    category: "Marketing",
    preview: "Results-focused layout with clean presentation",
    image: "photo-1498050108023-c5249f4df085",
    featured: false
  },
  {
    name: "Consultant",
    category: "Consulting",
    preview: "Trustworthy design that builds client confidence",
    image: "photo-1483058712412-4245e9b90334",
    featured: true
  }
];

const Templates = () => {
  return (
    <section id="templates" className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-slate-100">
            Templates for every profession
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Start with a professionally designed template and customize it to match your unique style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div 
              key={template.name}
              className="group card-floating rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl relative"
            >
              {template.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                </div>
              )}
              
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={`https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=800&q=80`}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {template.name}
                  </h3>
                  <span className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-md">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed">
                  {template.preview}
                </p>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm">
                    Use Template
                  </Button>
                  <Button size="sm" variant="outline" className="card-floating border-slate-600 text-slate-300 hover:bg-slate-700/30">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="card-floating border-slate-600 text-slate-300 hover:bg-slate-700/30">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" variant="outline" className="card-floating border-slate-600 text-slate-300 hover:bg-slate-700/30 px-8">
            View All Templates
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Templates;
