import { Clock } from "lucide-react";

const HeroSection = () => {
  const deadline = new Date("2026-04-05");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <header className="bg-accent text-accent-foreground">
      <div className="container max-w-4xl py-12 md:py-20 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">GP</span>
          </div>
          <span className="text-sm font-medium opacity-80">GetStatePension.com</span>
        </div>
        <h1 className="text-3xl md:text-5xl leading-tight mb-4">
          Is Buying Back UK State Pension Years Worth It?
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl">
          Calculate your ROI on voluntary NI contributions — and see why acting before 
          the April 2026 Class 2 deadline could save you thousands.
        </p>
        <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-lg px-4 py-2.5">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            <span className="text-primary">{daysLeft} days</span> until Class 2 contributions end for people abroad
          </span>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
