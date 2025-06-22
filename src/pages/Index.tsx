
import Hero from "@/components/Hero";
import CTA from "@/components/CTA";
import Navigation from "@/components/Navigation";
import ProblemSolution from "@/components/ProblemSolution";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
};

export default Index;
