import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import { ProblemSolution } from "@/components/landing-page/problem-solution";
import { Features } from "@/components/landing-page/features";
import { HowItWorks } from "@/components/landing-page/how-it-works";
import { FAQ } from "@/components/landing-page/faq";
import { CTA, Footer } from "@/components/landing-page/cta-footer";
import { AOSInit } from "@/components/aos-init";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      <AOSInit />
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
