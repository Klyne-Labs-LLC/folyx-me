
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Templates from "@/components/Templates";
import CTA from "@/components/CTA";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Templates />
      <CTA />
    </div>
  );
};

export default Index;
